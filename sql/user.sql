DROP TABLE IF EXISTS Chat;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS User;

CREATE TABLE User(
    id BIGINT AUTO_INCREMENT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password BLOB NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE Session(
    id CHAR(128) AUTO_INCREMENT,
    user_agent TEXT,
    user_id BIGINT,
    PRIMARY KEY(id)
);

CREATE TABLE Message(
    id BIGINT AUTO_INCREMENT NOT NULL,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT UTC_TIMESTAMP NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE Chat(
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_id BIGINT NOT NULL,
    unread_count INT DEFAULT 0 NOT NULL,
    PRIMARY KEY(recipient_id, sender_id),
    FOREIGN KEY (sender_id) REFERENCES User(id),
    FOREIGN KEY (recipient_id) REFERENCES User(id),
    FOREIGN KEY (message_id) REFERENCES Message(id)
);

INSERT INTO User VALUES(1, "user1", "");
INSERT INTO User VALUES(2, "user2", "");
INSERT INTO User VALUES(3, "user3", "");

INSERT INTO Message (id, recipient_id, sender_id, message) VALUES(1, 1, 1, "");
INSERT INTO Message (recipient_id, sender_id, message) VALUES(1, 2, "Hi :D");
INSERT INTO Chat VALUES(1, 2, LAST_INSERT_ID(), 0);
INSERT INTO Chat VALUES(2, 1, LAST_INSERT_ID(), 0);

INSERT INTO Message (recipient_id, sender_id, message) VALUES(2, 1, "Hello!");



