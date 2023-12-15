import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { editMessageEvent, init as initWebSocket, io } from "./socket";
export let pool: mysql.Pool;
let hasBeenInitialised = false;

export async function initSocket(server) {
  initWebSocket(server);
}

const random = Math.random();
console.log(random);
// setInterval(() => {
//   console.log("ee", random);
// }, 1000);

function dateToHuman(date: Date) {
  return date.toISOString();
}

interface SearchConfig {
  time: {
    from: {
      hour: number;
      minute: number;
    };
    to: {
      hour: number;
      minute: number;
    };
  };
  date: {
    from: string;
    to: string;
  };
  isReply: boolean;
  message: string;
}

export async function search(
  params: SearchConfig,
  userId: number,
  chatId: number,
  isGroup: boolean
) {
  params.message = `%${params.message}%`;

  if (isGroup) {
    const userInGroup = await isUserInGroup(userId, chatId);
    if (userInGroup !== true) return;

    const [rows] = await pool.execute(
      `
      SELECT m.*, u.username, m1.message as reply_message
      FROM 
        Group_replies r
        JOIN Group_message m1 ON (m1.id = r.replies_to)
        RIGHT JOIN Group_message m ON (r.message_id = m.id)
        JOIN User u ON (m.sender_id = u.id)
      WHERE m.group_id = ?
            AND m.message LIKE ?
            AND (? OR CONVERT_TZ(m.created_at, "+00:00", "-08:00") > ?)
            AND (? OR CONVERT_TZ(m.created_at, "+00:00", "-08:00") < ?)
            AND (? OR TIME(CONVERT_TZ(m.created_at, "+00:00", "-08:00")) > ?)
            AND (? OR TIME(CONVERT_TZ(m.created_at, "+00:00", "-08:00")) < ?)
            AND (? OR m1.message IS NOT NULL)
      ORDER BY m.id DESC`,
      [
        chatId,
        params.message,
        !params.date.from,
        params.date.from ?? null,
        !params.date.to,
        params.date.to ?? null,
        !params.time.from.hour && !params.time.from.minute,
        `${params.time.from.hour}:${params.time.from.minute}`,
        !params.time.to.hour && !params.time.to.minute,
        `${params.time.to.hour}:${params.time.to.minute}`,
        params.isReply !== true
      ]
    );

    console.log(rows);

    return rows;
  }

  const [rows] = await pool.execute(
    `
    SELECT m.created_at, m.id, m.message, m.sender_id, m.recipient_id, m1.message as reply_message 
    FROM 
      Replies r
      JOIN Message m1 ON (m1.id = r.replies_to)
      RIGHT JOIN Message m ON (r.message_id = m.id)
    WHERE (
            (m.sender_id = ? AND m.recipient_id = ?) OR 
            (m.sender_id = ? AND m.recipient_id = ?)
          ) 
          AND m.message LIKE ?
          AND (? OR CONVERT_TZ(m.created_at, "+00:00", "-08:00") > ?)
          AND (? OR CONVERT_TZ(m.created_at, "+00:00", "-08:00") < ?)
          AND (? OR TIME(CONVERT_TZ(m.created_at, "+00:00", "-08:00")) > ?)
          AND (? OR TIME(CONVERT_TZ(m.created_at, "+00:00", "-08:00")) < ?)
          AND (? OR m1.message IS NOT NULL)
    ORDER BY m.id DESC`,
    [
      userId,
      chatId,
      chatId,
      userId,
      params.message,
      !params.date.from,
      params.date.from ?? null,
      !params.date.to,
      params.date.to ?? null,
      !params.time.from.hour && !params.time.from.minute,
      `${params.time.from.hour}:${params.time.from.minute}`,
      !params.time.to.hour && !params.time.to.minute,
      `${params.time.to.hour}:${params.time.to.minute}`,
      params.isReply !== true
    ]
  );

  return rows;
}

export async function getChats(userId: number) {
  await init();
  const [rows] = (await pool.execute(
    `    
        SELECT 
          c.sender_id, 
          c.unread_count, 
          m.message, 
          m.id, 
          u.username, 
          c.created_at,
          FALSE as is_group
        FROM Chat c
            JOIN User u ON (c.sender_id = u.id)
            LEFT JOIN Message m ON (m.id = c.message_id)
        WHERE c.recipient_id = ?

        UNION
        
        SELECT 
          g.id as sender_id, 
          gm.unread_count,
          m.message, 
          m.id, 
          g.name as username, 
          gc.created_at,
          TRUE as is_group
        FROM Group_chat gc 
             JOIN User_group g ON (g.id = gc.group_id)
             JOIN Group_member gm ON (gm.group_id = g.id AND gm.user_id = ?)
             LEFT JOIN Group_message m ON (m.id = gc.message_id)
             
        ORDER BY created_at DESC`,
    [userId, userId]
  )) as RowDataPacket[][];

  for (const row of rows) {
    if (row.created_at) {
      row.created_at = dateToHuman(new Date(row.created_at));
    }
  }

  return rows;
}

export async function createGroup(userId: number, name: string) {
  const [row] = (await pool.execute(
    `INSERT INTO User_group (name, owner_id)
      VALUES (?, ?)`,
    [name, userId]
  )) as RowDataPacket[];

  const groupId = row.insertId;

  await pool.execute(
    `INSERT INTO Group_chat (group_id)
      VALUES (?)`,
    [groupId]
  );

  await pool.execute(
    `INSERT INTO Group_member (group_id, user_id, unread_count)
      VALUES (?, ?, ?)`,
    [groupId, userId, 0]
  );
}

export async function isOwner(ownerId: number, groupId: number) {
  const [row] = (await pool.execute(
    `SELECT owner_id
    FROM User_group 
    WHERE id = ?`,
    [groupId]
  )) as RowDataPacket[];

  return ownerId === row[0].owner_id;
}

export async function addToGroup(ownerId: number, userId: number, groupId: number) {
  if (!(await isOwner(ownerId, groupId)))
    throw new Error("You are not authorized to add a user to this group.");

  await pool.execute(
    `INSERT INTO Group_member (group_id, user_id, unread_count)
      VALUES (?, ?, ?)`,
    [groupId, userId, 0]
  );
}

export async function editMessage(
  messageId: number,
  userId: number,
  message: string,
  isGroup: boolean
) {
  if (isGroup) {
    const res = (await pool.execute(
      `UPDATE Group_message
       SET message = ?
       WHERE id = ? AND sender_id = ?`,
      [message, messageId, userId]
    )) as ResultSetHeader[];

    // @todo: implement websockets
    // if (res[0].affectedRows === 1) {
    //   editMessageEvent(userId, message, messageId);
    // }
    return;
  }
  await pool.execute(
    `UPDATE Message
     SET message = ?
     WHERE id = ? AND sender_id = ?`,
    [message, messageId, userId]
  );
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

export async function changeUsername(userId: string, username: string) {
  if (!username) throw new Error("Invalid username");

  await pool.execute(
    `UPDATE User
     SET username = ?
     WHERE id = ?`,
    [username, userId]
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

  if (!rows || !rows[0] || rows[0].length === 0) {
    throw new Error("Token not found");
  } else {
    return rows[0].user_id;
  }
}

export async function deleteGroupMessage(messageId: number, senderId: number, groupId: number) {
  await pool.execute(`DELETE FROM Group_message where id = ? AND sender_id = ?`, [
    messageId,
    senderId
  ]);
}

export async function deleteGroup(groupId: number, ownerId: number) {
  if (!(await isOwner(ownerId, groupId)))
    throw new Error("You are not authorized to delete this group.");

  await pool.execute(`DELETE FROM User_group where id = ? AND owner_id = ?`, [groupId, ownerId]);
}

export async function deleteMessage(
  messageId: number,
  senderId: number,
  recipientId: number,
  isGroup: boolean
) {
  if (isGroup) {
    deleteGroupMessage(messageId, senderId, recipientId);
    return;
  }

  const [rows] = (await pool.execute(
    `SELECT * FROM Message m
      WHERE (
              (m.sender_id = ? AND m.recipient_id = ?) OR 
              (m.sender_id = ? AND m.recipient_id = ?)
            )
      ORDER BY m.id DESC 
      LIMIT 2`,
    [senderId, recipientId, recipientId, senderId]
  )) as RowDataPacket[][];

  if (rows[0].id === messageId) {
    if (rows.length === 1) {
      // Since there's only one message, we can delete off
      // the whole chat
      await pool.execute(
        `DELETE FROM Chat
         WHERE  (
                  (sender_id = ? AND recipient_id = ?) OR 
                  (sender_id = ? AND recipient_id = ?)
                )`,
        [senderId, recipientId, recipientId, senderId]
      );
    } else if (rows.length === 2) {
      // If there are more than 2 messags, we can set
      // the message_id to the second last message
      const substituteId = rows[1].id;
      await pool.execute(
        `UPDATE Chat
         SET message_id = ?
         WHERE  (
                  (sender_id = ? AND recipient_id = ?) OR 
                  (sender_id = ? AND recipient_id = ?)
                )`,
        [substituteId, senderId, recipientId, recipientId, senderId]
      );
    }
  }

  await pool.execute(`DELETE FROM Message where id = ? AND sender_id = ?`, [messageId, senderId]);
}

export async function getLastId(
  sender_id: number,
  recipient_id: number,
  isGroup: boolean
): Promise<number> {
  await init();

  if (isGroup) {
    const userInGroup = await isUserInGroup(recipient_id, sender_id);
    if (userInGroup !== true) return;

    const [rows] = (await pool.execute(
      `   
      SELECT m.id FROM 
        Group_message m
      WHERE m.group_id = ?
      ORDER BY m.id DESC 
      LIMIT 1`,
      [sender_id]
    )) as RowDataPacket[];

    if (rows.length === 0) {
      return -1;
    } else {
      return rows[0].id;
    }
  }

  const [rows] = (await pool.execute(
    `
        SELECT m.id 
        FROM Chat c 
             JOIN User u ON (c.sender_id = u.id) 
             JOIN Message m ON (m.id = c.message_id) 
        WHERE c.recipient_id = ? AND c.sender_id = ?
        ORDER BY m.created_at DESC
        LIMIT 1`,
    [recipient_id, sender_id]
  )) as RowDataPacket[];

  if (rows.length === 0) {
    return -1;
  } else {
    return rows[0].id;
  }
}

async function isUserInGroup(userId: number, groupId: number) {
  const [rows] = (await pool.execute(
    `
    SELECT 1
    FROM Group_member
    WHERE group_id = ? AND user_id = ?;`,
    [groupId, userId]
  )) as RowDataPacket[][];

  return rows.length > 0;
}

export async function getMessages(
  senderId: number,
  recipientId: number,
  lastId = -1,
  greater = false,
  isGroup: boolean
) {
  const condition = greater ? `m.id > ?` : `m.id < ?`;
  const order = greater ? `ASC` : `DESC`;

  if (isGroup) {
    const userInGroup = await isUserInGroup(senderId, recipientId);
    if (userInGroup !== true) return;

    const [rows] = (await pool.execute(
      `
      SELECT m.*, u.username, m1.message as reply_message FROM 
        Group_replies r
        JOIN Group_message m1 ON (m1.id = r.replies_to)
        RIGHT JOIN Group_message m ON (r.message_id = m.id)
        JOIN User u ON (m.sender_id = u.id)
      WHERE m.group_id = ?
            AND ${condition}
      ORDER BY m.id ${order} 
      LIMIT 10
      ${!greater ? "" : ""}`,
      [recipientId, lastId === -1 ? Infinity : lastId]
    )) as RowDataPacket[][];

    for (const row of rows) {
      row.created_at = dateToHuman(row.created_at);
    }

    await pool.execute(
      `UPDATE Group_member
      SET unread_count = 0
      WHERE group_id = ? AND user_id = ?;`,
      [recipientId, senderId]
    );

    return rows;
  }

  const [rows] = (await pool.execute(
    `SELECT m.created_at, m.id, m.message, m.sender_id, m.recipient_id, m1.message as reply_message FROM 
      Replies r
      JOIN Message m1 ON (m1.id = r.replies_to)
      RIGHT JOIN Message m ON (r.message_id = m.id)
    WHERE (
            (m.sender_id = ? AND m.recipient_id = ?) OR 
            (m.sender_id = ? AND m.recipient_id = ?)
          ) AND ${condition}
    ORDER BY m.id ${order} 
    LIMIT 10
    ${!greater ? "" : ""}`,
    [senderId, recipientId, recipientId, senderId, lastId === -1 ? Infinity : lastId]
  )) as RowDataPacket[][];

  for (const row of rows) {
    row.created_at = dateToHuman(row.created_at);
  }

  await pool.execute("UPDATE Chat SET unread_count = 0 WHERE recipient_id = ? AND sender_id = ?", [
    senderId,
    recipientId
  ]);

  return rows;
}

export async function deleteChat(sender_id: number, recipient_id: number) {
  await pool.execute(
    `DELETE FROM Chat
     WHERE (sender_id = ? AND recipient_id = ?) OR
           (recipient_id = ? AND sender_id = ?)`,
    [sender_id, recipient_id, sender_id, recipient_id]
  );
}

export async function sendMessage(
  recipient_id: number,
  sender_id: number,
  content: string,
  replyId: number,
  isGroup: boolean
) {
  await init();

  if (isGroup === true) {
    const userInGroup = await isUserInGroup(sender_id, recipient_id);
    if (userInGroup !== true) return;

    const res = (await pool.execute(
      `
          INSERT INTO Group_message 
              (sender_id, group_id, message)
              VALUES(?, ?, ?);`,
      [sender_id, recipient_id, content]
    )) as RowDataPacket[];

    const insertId = res[0].insertId;

    await pool.execute(
      `UPDATE Group_chat 
       SET 
         message_id = ?,
         created_at = UTC_TIMESTAMP()
       WHERE group_id = ?;`,
      [insertId, recipient_id]
    );

    await pool.execute(
      `UPDATE Group_member
      SET unread_count = unread_count + 1
      WHERE group_id = ?;`,
      [recipient_id]
    );

    if (replyId !== -1 && typeof replyId === "number") {
      // Making sure the message that's being replied to
      // was sent in the right group chat

      const [rows] = (await pool.execute(
        `SELECT * FROM Group_message 
          WHERE id = ?`,
        [replyId]
      )) as RowDataPacket[][];

      if (rows.length === 0) return;

      if (rows[0].group_id === recipient_id) {
        await pool.execute(`INSERT INTO Group_replies VALUES(?, ?);`, [insertId, replyId]);
      } else {
        throw new Error("Forbidden reply");
      }
    }
    return;
  }

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

  const res = (await pool.execute(
    `
        INSERT INTO Message 
            (recipient_id, sender_id, message) 
            VALUES(?, ?, ?);`,
    [recipient_id, sender_id, content]
  )) as mysql.ResultSetHeader[];

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
    const [rows] = (await pool.execute(
      `SELECT * FROM Message 
        WHERE id = ?`,
      [replyId]
    )) as RowDataPacket[][];

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
}

export async function init() {
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

// for(let i = 0; i < 100000; i++) {
//     sendMessage(1, 1, i.toString());
// }

(async function () {
  await init();
  // console.log(await search("qwe", 1, 1, false));

  // for (let i = 0; i < 200000; i++) {
  //   const id1 = 60000 + Math.floor(Math.random() * (235131 - 60000));
  //   const id2 = 60000 + Math.floor(Math.random() * (235131 - 60000));

  //   try {
  //     await pool.execute(`INSERT INTO Replies VALUES(?, ?)`, [id1, id2]);
  //   } catch (err) {
  //     console.log(id1, id2);
  //     // console.error(err);
  //   }
  // }
})();
