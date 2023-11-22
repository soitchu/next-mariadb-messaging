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
    connectionLimit: 10,
    timezone: "+00:00"
  });

  hasBeenInitialised = true;
}

async function sendMessage(recipient_id: number, sender_id: number, content: string) {
  const res = await pool.execute(
    `
          INSERT INTO Message 
              (recipient_id, sender_id, message) 
              VALUES(?, ?, ?);`,
    [recipient_id, sender_id, content]
  );

  const insertId = res[0].insertId;

  const ids = [
    [sender_id, recipient_id],
    [recipient_id, sender_id]
  ];

  for (const id of ids) {
    await pool.execute(
      `
          INSERT INTO Chat 
          VALUES (?, ?, ?, 1) 
          ON DUPLICATE KEY UPDATE 
              message_id =  ?, 
              unread_count = unread_count + 1;`,
      [id[1], id[0], insertId, insertId]
    );
  }
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

(async function () {
  await init();

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../dummy-data/data/processedData.json"), "utf8")
  );

  for (const username of data.users) {
    const hashedPassword = await Bcrypt.hash("qwerty1234", 10);
    await pool.execute(
      `
                  INSERT INTO User (username, hashed_password)
                  VALUES (?, ?)`,
      [username, hashedPassword]
    );
  }

  for (const convo of data.conversations) {
    const users = convo.agents;
    let count = 0;
    const ids = [(await getUserInfo(users[0]))[1], (await getUserInfo(users[1]))[1]];

    for (const message of convo.messages) {
      try {
        await sendMessage(ids[count % 2], ids[(count + 1) % 2], message);
      } catch (err) {
        console.error(message);
      }
      count++;
    }
  }
})();
