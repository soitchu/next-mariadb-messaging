DROP TABLE IF EXISTS Chat;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS User;

CREATE TABLE User(
    id BIGINT AUTO_INCREMENT,
    username VARCHAR(50),
    hashed_password BLOB,
    PRIMARY KEY (id)
);

CREATE TABLE Message(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT,
    sender_id BIGINT,
    message TEXT,
    created_at DATETIME
);

CREATE TABLE Chat(
    recipient_id BIGINT,
    sender_id BIGINT,
    message_id BIGINT,
    unread_count INT DEFAULT 0,
    PRIMARY KEY(recipient_id, sender_id),
    FOREIGN KEY (sender_id) REFERENCES User(id),
    FOREIGN KEY (recipient_id) REFERENCES User(id),
    FOREIGN KEY (message_id) REFERENCES Message(id)
);



INSERT INTO User VALUES(1, "user1", NULL);
INSERT INTO User VALUES(2, "user2", NULL);
INSERT INTO User VALUES(3, "user3", NULL);



INSERT INTO Message (recipient_id, sender_id, message, created_at) VALUES(1, 2, "Hi :D", "2023-11-17 16:23:44");
-- SELECT  LAST_INSERT_ID();
INSERT INTO Chat VALUES(1, 2, LAST_INSERT_ID(), 0);

INSERT INTO Message VALUES(101, 2, 1, "Hello!", "2023-11-17 16:24:44");



