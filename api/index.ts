import mysql, { RowDataPacket } from "mysql2/promise";
let pool: mysql.Pool;
let hasBeenInitialised = false;

function dateToHuman(date: Date) {
    return date.getHours().toString().padStart(2, "0") + " : " + date.getMinutes().toString().padStart(2, "0");
}

export async function getChats() {
    await init();
    const [rows] = await pool.execute(`
        SELECT c.sender_id, c.unread_count, m.message, u.username, m.created_at 
        FROM Chat c 
             JOIN User u ON (c.sender_id = u.id) 
             JOIN Message m ON (m.id = c.message_id) 
        WHERE c.recipient_id = ? 
        ORDER BY m.created_at DESC`, [1]);

    for (const row of rows) {
        row.created_at = dateToHuman(row.created_at);
    }

    return rows;
}

export async function deleteMessage(messageId: number, senderId: number) {
    const [lastMessageIds] = await pool.execute(`SELECT * FROM Message WHERE sender_id = ? ORDER BY id DESC LIMIT 2;`, [senderId]) as mysql.RowDataPacket[];

    if (lastMessageIds.length === 0) return;

    let secondLastId = -1;

    if (lastMessageIds.length === 2) {
        secondLastId = lastMessageIds[1].id;
    }
    const recipientId = lastMessageIds[0].recipient_id;

    console.log(recipientId, typeof messageId, typeof lastMessageIds[0].id);

    if (messageId === lastMessageIds[0].id) {
        await pool.execute(`
            UPDATE Chat SET message_id = ? WHERE sender_id = ? AND recipient_id = ?`,
            [
                secondLastId,
                senderId,
                recipientId,
            ]);
        await pool.execute(`
            DELETE FROM Message where id = ? AND sender_id = ?`,
            [
                secondLastId,
                senderId,
                recipientId,
            ]);
    }
    // await pool.execute(`
    //     DELETE FROM Message where id = ? AND sender_id = ?
    // `, [messageId, senderId]);
}


    export async function getLastId(sender_id: string): Promise<number> {
        console.log(sender_id);
        await init();
        const [rows] = await pool.execute(`
        SELECT m.id 
        FROM Chat c 
             JOIN User u ON (c.sender_id = u.id) 
             JOIN Message m ON (m.id = c.message_id) 
        WHERE c.recipient_id = ? AND c.sender_id = ?
        ORDER BY m.created_at DESC`, [1, sender_id]) as RowDataPacket[];

        if (rows.length === 0) {
            return -1;
        } else {
            return rows[0].id;
        }
    }

    export async function getMessages(senderId: number, recipientId: number, lastId = -1, greater = false) {
        const condition = greater ? `id > ?` : `id < ?`;

        const [rows] = await pool.execute(`
        SELECT * FROM Message 
        WHERE (
                (sender_id = ? AND recipient_id = ?) OR 
                (sender_id = ? AND recipient_id = ?)
              ) AND ${condition}
        ORDER BY id DESC 
        ${!greater ? "LIMIT 100" : ""}`,
            [
                senderId,
                recipientId,
                recipientId,
                senderId,
                lastId === -1 ? Infinity : lastId
            ]);

        for (const row of rows) {
            row.created_at = dateToHuman(row.created_at);
        }

        await pool.execute('UPDATE Chat SET unread_count = 0 WHERE recipient_id = ? AND sender_id = ?', [senderId, recipientId]);

        return rows;
    }


    export async function sendMessage(recipient_id: number, sender_id: number, content: string) {
        await init();

        const mysqlDate = (new Date()).toISOString().split("T").join(" ").split(".")[0];

        const res = await pool.execute(`
        INSERT INTO Message 
            (recipient_id, sender_id, message, created_at) 
            VALUES(?, ?, ?, ?);`,
            [
                recipient_id,
                sender_id,
                content,
                mysqlDate,
            ]);

        const insertId = res[0].insertId;

        await pool.execute(`
        INSERT INTO Chat 
        VALUES (?, ?, ?, 1) 
        ON DUPLICATE KEY UPDATE 
            message_id =  ?, 
            unread_count = unread_count + 1;`,
            [
                sender_id,
                recipient_id,
                insertId,
                insertId,
            ]);

    }

    export async function init() {
        if (hasBeenInitialised) return;

        pool = mysql.createPool({
            host: "localhost",
            user: "soitchu",
            database: "test",
            connectionLimit: 10,
        });

        hasBeenInitialised = true;
    }

    // for(let i = 0; i < 100000; i++) {
    //     sendMessage(1, 1, i.toString());
    // }

    (async function () {
        await init();
    })();