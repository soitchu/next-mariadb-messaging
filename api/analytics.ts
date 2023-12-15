import { RowDataPacket } from "mysql2";
import { pool } from "./index";

// Most active hours
//

// Longest message
// SELECT * FROM Message WHERE LENGTH(message) = (SELECT MAX(LENGTH(message)) FROM Message);

// Longest messages
// SELECT id, message FROM Message WHERE LENGTH(message) >= (SELECT LENGTH(message) FROM Message ORDER BY LENGTH(message) DESC LIMIT 1 OFFSET 9);

// Number of messages sent by users
// SELECT COUNT(*) as count, sender_id FROM Message GROUP BY sender_id DESC ORDER BY count DESC LIMIT 10;

// Number of messages greater than the average message length
// SELECT COUNT(*) FROM Message WHERE LENGTH(message) > (SELECT AVG(LENGTH(message)) FROM Message);

// Average number of sessions per user
// SELECT AVG(count) FROM (SELECT COUNT(*) as count FROM Session GROUP BY user_id) a;

// Average number of messages sent by users
// SELECT AVG(count) FROM (SELECT COUNT(*) as count, sender_id FROM Message GROUP BY sender_id DESC ORDER BY count DESC) tmp;

// Average number of messages sent by users at a particular hour
// SELECT AVG(count) FROM (SELECT COUNT(*) as count, sender_id FROM Message WHERE HOUR(created_at) = 17 GROUP BY sender_id DESC ORDER BY count DESC) tmp;

export async function getMostActiveHours(): Promise<{ count: number; hour: number }[]> {
  const [rows] = (await pool.execute(`
    SELECT COUNT(*) as count, HOUR(created_at)  as hour
    FROM Message 
    GROUP BY HOUR(created_at) 
    ORDER BY COUNT(*) DESC;`)) as RowDataPacket[][];
  return rows as { count: number; hour: number }[];
}

export async function getMostActiveUser() {
  const [rows] = (await pool.execute(`
    SELECT COUNT(*) as count, sender_id, u.username 
    FROM Message m
         JOIN User u ON(m.sender_id = u.id) 
    GROUP BY sender_id DESC
    ORDER BY count DESC 
    LIMIT 10;`)) as RowDataPacket[][];
  return rows;
}

export async function averageMessageAt(hour: number) {
  const [rows] = (await pool.execute(`
    SELECT AVG(count) 
    FROM (SELECT COUNT(*) as count, sender_id 
          FROM Message 
          WHERE HOUR(created_at) = 17 
          GROUP BY sender_id 
          DESC) tmp;`)) as RowDataPacket[][];
  return rows;
}

export async function getLongestMessages() {
  const [rows] = (await pool.execute(`
    SELECT u.username, message 
    FROM Message m
         JOIN User u ON(m.sender_id = u.id) 
    WHERE LENGTH(message) >= (SELECT LENGTH(message)
                              FROM Message m
                              ORDER BY LENGTH(message) 
                              DESC LIMIT 1 OFFSET 9)
    ORDER BY LENGTH(message) DESC`)) as RowDataPacket[][];
  return rows;
}

export async function isAdmin(userId: string) {
  const [rows] = (await pool.execute(
    `SELECT is_admin 
     FROM User
     WHERE id = ?`,
    [userId]
  )) as RowDataPacket[][];
  return rows[0].is_admin;
}
