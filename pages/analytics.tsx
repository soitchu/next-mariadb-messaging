import React, { useRef } from "react";

// Most active hour
// SELECT COUNT(*), HOUR(created_at) FROM Message GROUP BY HOUR(created_at) ORDER BY COUNT(*) DESC;

// Longest message
// SELECT * FROM Message WHERE LENGTH(message) = (SELECT MAX(LENGTH(message)) FROM Message);

// Number of messages greater than the average message length
// SELECT COUNT(*) FROM Message WHERE LENGTH(message) > (SELECT AVG(LENGTH(message)) FROM Message);

// Average number of sessions per user
// SELECT AVG(count) FROM (SELECT COUNT(*) as count FROM Session GROUP BY user_id) a;

// Number of messages sent by users
//  SELECT COUNT(*) as count, sender_id FROM Message GROUP BY sender_id DESC ORDER BY count DESC;

// Average number of messages sent by users
// SELECT AVG(count) FROM (SELECT COUNT(*) as count, sender_id FROM Message GROUP BY sender_id DESC ORDER BY count DESC) tmp;

// Average number of messages sent by users at a particular hour
// SELECT AVG(count) FROM (SELECT COUNT(*) as count, sender_id FROM Message WHERE HOUR(created_at) = 17 GROUP BY sender_id DESC ORDER BY count DESC) tmp;

export default function Analytics() {
  return <div></div>;
}
