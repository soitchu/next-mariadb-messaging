SELECT m.created_at, m.id, m.message FROM 
    Message m
    WHERE (
            (m.sender_id = 1 AND m.recipient_id = 2) OR 
            (m.sender_id = 1 AND m.recipient_id = 2)
          ) AND m.message LIKE "%there%"
    ORDER BY m.id DESC