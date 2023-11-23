SELECT 
    g.id as sender_id, 
    m.message, 
    m.id, 
    g.name as username, 
    m.created_at,
    0 as unread_count
    FROM Group_chat gc 
         JOIN User_group g ON (g.id = gc.id)
         JOIN Group_member gm ON (gm.group_id = g.id AND gm.user_id = 1)
         JOIN Group_message m ON (m.id = gc.message_id)