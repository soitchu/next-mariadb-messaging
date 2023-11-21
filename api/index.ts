import mysql, { RowDataPacket } from "mysql2/promise";
export let pool: mysql.Pool;
let hasBeenInitialised = false;

function dateToHuman(date: Date) {
  return date.toISOString();
}

export async function getChats(userId: number) {
  await init();
  const [rows] = (await pool.execute(
    `
        SELECT c.sender_id, c.unread_count, m.message, m.id, u.username, m.created_at 
        FROM Chat c 
             JOIN User u ON (c.sender_id = u.id) 
             JOIN Message m ON (m.id = c.message_id) 
        WHERE c.recipient_id = ? 
        ORDER BY m.created_at DESC`,
    [userId]
  )) as RowDataPacket[][];

  for (const row of rows) {
    row.created_at = dateToHuman(row.created_at);
  }

  return rows;
}

export async function addUser(username: string, hashedPassword: string) {
  await pool.execute(
    `
            INSERT INTO User (username, hashed_password) 
            VALUES (?, ?)`,
    [username, hashedPassword]
  );
}

export async function addSession(userId: string, userAgent: string, token: string) {
  await pool.execute(
    `
            INSERT INTO Session (id, user_id, user_agent) 
            VALUES (?, ?, ?)`,
    [token, userId, userAgent]
  );
}

export async function getUserInfo(username: string) {
  const [rows] = (await pool.execute(
    `
        SELECT hashed_password, id
        FROM User
        WHERE username = ?`,
    [username]
  )) as RowDataPacket[][];

  if (!rows || !rows[0] || rows[0].length === 0) {
    return [undefined, undefined];
  } else {
    return [rows[0].hashed_password, rows[0].id];
  }
}

export async function getUserIdByToken(token: string) {
  const [rows] = (await pool.execute(
    `
        SELECT user_id
        FROM Session
        WHERE id = ?`,
    [token]
  )) as RowDataPacket[][];

  if (rows[0].length === 0) {
    throw new Error("Token not found");
  } else {
    return rows[0].user_id;
  }
}

export async function deleteMessage(messageId: number, senderId: number, recipientId: number) {
  await pool.execute(
    `
            DELETE FROM Message where id = ? AND sender_id = ?`,
    [messageId, senderId]
  );
}

export async function getLastId(sender_id: number, recipient_id: number): Promise<number> {
  await init();
  const [rows] = (await pool.execute(
    `
        SELECT m.id 
        FROM Chat c 
             JOIN User u ON (c.sender_id = u.id) 
             JOIN Message m ON (m.id = c.message_id) 
        WHERE c.recipient_id = ? AND c.sender_id = ?
        ORDER BY m.created_at DESC`,
    [recipient_id, sender_id]
  )) as RowDataPacket[];

  if (rows.length === 0) {
    return -1;
  } else {
    return rows[0].id;
  }
}

export async function getMessages(
  senderId: number,
  recipientId: number,
  lastId = -1,
  greater = false
) {
  const condition = greater ? `id > ?` : `id < ?`;

  const [rows] = await pool.execute(
    `
        SELECT * FROM Message 
        WHERE (
                (sender_id = ? AND recipient_id = ?) OR 
                (sender_id = ? AND recipient_id = ?)
              ) AND ${condition}
        ORDER BY id DESC 
        ${!greater ? "LIMIT 100" : ""}`,
    [senderId, recipientId, recipientId, senderId, lastId === -1 ? Infinity : lastId]
  );

  for (const row of rows) {
    console.log(row.created_at);
    row.created_at = dateToHuman(row.created_at);
  }

  await pool.execute("UPDATE Chat SET unread_count = 0 WHERE recipient_id = ? AND sender_id = ?", [
    senderId,
    recipientId
  ]);

  return rows;
}

export async function sendMessage(recipient_id: number, sender_id: number, content: string) {
  await init();

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

export async function init() {
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

// for(let i = 0; i < 100000; i++) {
//     sendMessage(1, 1, i.toString());
// }

(async function () {
  await init();
})();
