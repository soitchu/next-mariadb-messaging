const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const Bcrypt = require("bcrypt");

let pool;
let hasBeenInitialised = false;

async function init() {
  if (hasBeenInitialised) return;

  pool = mysql.createPool({
    host: "localhost",
    user: "soitchu",
    database: "test",
    connectionLimit: 100,
    timezone: "+00:00"
  });

  hasBeenInitialised = true;
}

async function sendMessage(
  recipient_id: number,
  sender_id: number,
  content: string,
  replyId: number,
  sentAt: Date
) {
  const ids = [
    [sender_id, recipient_id],
    [recipient_id, sender_id]
  ];

  for (const id of ids) {
    await pool.execute(
      `
        INSERT IGNORE INTO Chat 
        (recipient_id, sender_id, message_id, unread_count)
        VALUES (?, ?, ?, 1)`,
      [id[1], id[0], null]
    );
  }

  const res = await pool.execute(
    `
        INSERT INTO Message 
            (recipient_id, sender_id, message, created_at) 
            VALUES(?, ?, ?, ?);`,
    [recipient_id, sender_id, content, sentAt]
  );

  const insertId = res[0].insertId;

  for (const id of ids) {
    await pool.execute(
      `
        UPDATE Chat 
        SET
            message_id =  ?, 
            created_at = UTC_TIMESTAMP(),
            unread_count = unread_count + 1
        WHERE sender_id = ? AND
              recipient_id = ?;`,
      [insertId, id[1], id[0]]
    );

    if (ids[0] === ids[1]) break;
  }

  if (replyId !== -1 && typeof replyId === "number") {
    const [rows] = await pool.execute(
      `SELECT * FROM Message 
        WHERE id = ?`,
      [replyId]
    );

    if (rows.length === 0) return;

    // Making sure the message that's being replied to
    // was sent by the people involed in the chat

    if (
      (rows[0].recipient_id === recipient_id && rows[0].sender_id === sender_id) ||
      (rows[0].recipient_id === sender_id && rows[0].sender_id === recipient_id)
    ) {
      await pool.execute(`INSERT INTO Replies VALUES(?, ?);`, [insertId, replyId]);
    } else {
      throw new Error("Forbidden reply");
    }
  }

  return insertId;
}

async function getUserInfo(username: string) {
  const [rows] = await pool.execute(
    `
          SELECT hashed_password, id
          FROM User
          WHERE username = ?`,
    [username]
  );

  if (!rows || !rows[0] || rows[0].length === 0) {
    return [undefined, undefined];
  } else {
    return [rows[0].hashed_password, rows[0].id];
  }
}

async function addConversation(convo) {
  const users = convo.agents;
  let count = 0;
  const ids = [(await getUserInfo(users[0]))[1], (await getUserInfo(users[1]))[1]];
  let previousMessageId = -1;
  let timestamp = 1698859613 * 1000;
  const messageArray = [];

  for (const message of convo.messages) {
    const sentAt = new Date(timestamp);
    timestamp += 3.6e6 + Math.floor(Math.random() * 1.8e7); // 1-6 hours
    messageArray.push(ids[count % 2], ids[(count + 1) % 2], message, sentAt);

    try {
      previousMessageId = await sendMessage(
        ids[count % 2],
        ids[(count + 1) % 2],
        message,
        Math.floor(Math.random() * 10) % 5 === 0 ? previousMessageId : -1,
        sentAt
      );
    } catch (err) {
      console.error(err);
    }
    count++;
  }
}

(async function () {
  await init();

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../dummy-data/data/processedData.json"), "utf8")
  );
  const hashedPassword = await Bcrypt.hash("qwerty1234", 10);

  for (const username of data.users) {
    try {
      await pool.execute(
        `INSERT INTO User (username, hashed_password)
        VALUES (?, ?)`,
        [username, hashedPassword]
      );
    } catch (err) {
      console.error(err);
    }
  }

  for (const convo of data.conversations) {
    addConversation(convo);
  }
})();
