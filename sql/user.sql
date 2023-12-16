DROP TABLE IF EXISTS Group_replies;
DROP TABLE IF EXISTS Group_chat;
DROP TABLE IF EXISTS Group_message;
DROP TABLE IF EXISTS Group_member;
DROP TABLE IF EXISTS User_group;
DROP TABLE IF EXISTS Replies;
ALTER TABLE Chat DROP CONSTRAINT fk_message;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS Chat;
DROP TABLE IF EXISTS Session;
DROP TABLE IF EXISTS User;

CREATE TABLE User(
    id BIGINT AUTO_INCREMENT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password BLOB NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY(id)
);

CREATE TABLE Session(
    id CHAR(128),
    user_agent TEXT,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE Chat(
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_id BIGINT,
    unread_count INT DEFAULT 0 NOT NULL,
    message_created_at TIMESTAMP DEFAULT UTC_TIMESTAMP NOT NULL,
    PRIMARY KEY(recipient_id, sender_id),
    FOREIGN KEY (sender_id) REFERENCES User(id),
    FOREIGN KEY (recipient_id) REFERENCES User(id)
);


-- Although this is a circular relation, this enables us to delete
-- a chat along with its messages by just removing the chat entry

CREATE TABLE Message(
    id BIGINT AUTO_INCREMENT NOT NULL,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT UTC_TIMESTAMP NOT NULL,
    FOREIGN KEY (sender_id, recipient_id) REFERENCES Chat(sender_id, recipient_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id, recipient_id) REFERENCES Chat(recipient_id, sender_id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

ALTER TABLE Chat ADD CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES Message(id) ON DELETE SET NULL;

CREATE TABLE Replies(
    message_id BIGINT NOT NULL,
    replies_to  BIGINT NOT NULL,
    PRIMARY KEY(message_id),
    FOREIGN KEY (message_id) REFERENCES Message(id) ON DELETE CASCADE,
    FOREIGN KEY (replies_to) REFERENCES Message(id) ON DELETE CASCADE
);

-- Can't just use `Group` as the name
CREATE TABLE User_group(
    id BIGINT AUTO_INCREMENT NOT NULL,
    owner_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (owner_id) REFERENCES User(id)
);

CREATE TABLE Group_member(
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    unread_count INT DEFAULT 0 NOT NULL,
    PRIMARY KEY(group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES User_group(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);


-- Here, setting FOREIGN KEY (group_id, sender_id) REFERENCES Group_member(group_id, user_id)
-- Would have been better, since that'd ensure that the message that are being sent are 
-- by members of the group, but this would make it so the members can't leave
-- the group, and would add a lot of complexity. So it's probably better to 
-- just set separate foreign keys

CREATE TABLE Group_message(
    id BIGINT AUTO_INCREMENT NOT NULL,
    sender_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT UTC_TIMESTAMP NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (group_id) REFERENCES User_group(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES User(id)
);


-- Using NULL is better for message_id since it'd make the group
-- chat pop up on users' chat list, even if no message has been sent

-- Also, storing `created_at` is redundant, but this is useful if all
-- of the messages have been deleted, and we still want to sort the chat
-- list by time at which the last message that was sent

CREATE TABLE Group_chat(
    group_id BIGINT NOT NULL,
    message_id BIGINT NULL,
    message_created_at TIMESTAMP DEFAULT UTC_TIMESTAMP NOT NULL,
    PRIMARY KEY(group_id),
    FOREIGN KEY (group_id) REFERENCES User_group(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES Group_message(id) ON DELETE SET NULL
);

CREATE TABLE Group_replies(
    message_id BIGINT NOT NULL,
    replies_to  BIGINT NOT NULL,
    PRIMARY KEY(message_id),
    FOREIGN KEY (message_id) REFERENCES Group_message(id) ON DELETE CASCADE,
    FOREIGN KEY (replies_to) REFERENCES Group_message(id) ON DELETE CASCADE
);

-- Password: qwerty1234
INSERT INTO User VALUES(1, "user1", "$2b$10$ZBvVifQCBi32AbQy7qpeU.7d5IaZYSR23s.YcjnHsfc7k2i7kcMVm", FALSE);
INSERT INTO User VALUES(2, "user2", "$2b$10$ZBvVifQCBi32AbQy7qpeU.7d5IaZYSR23s.YcjnHsfc7k2i7kcMVm", FALSE);
INSERT INTO User VALUES(3, "user3", "$2b$10$ZBvVifQCBi32AbQy7qpeU.7d5IaZYSR23s.YcjnHsfc7k2i7kcMVm", FALSE);

-- Password: admin
INSERT INTO User VALUES(4, "admin", "$2b$10$6/SoWpxPc7axHFymvZy1TOAeav.VmCU.JVI/Yifjo9mSP/qYwxGfO", TRUE);


INSERT INTO Chat (recipient_id, sender_id, message_id, unread_count) VALUES(1, 2, NULL, 0);
INSERT INTO Chat (recipient_id, sender_id, message_id, unread_count) VALUES(2, 1, NULL, 0);


INSERT INTO Message (recipient_id, sender_id, message) VALUES(1, 2, "Hi :D");
INSERT INTO Message (recipient_id, sender_id, message) VALUES(2, 1, "Hello!");

INSERT INTO User_group (name, owner_id) VALUES("test group", 1);
INSERT INTO Group_member VALUES(1, 1, 0);
INSERT INTO Group_member VALUES(1, 2, 0);
INSERT INTO Group_message (sender_id, group_id, message) VALUES(1, 1, "Hello :)");
INSERT INTO Group_chat (group_id, message_id) VALUES(1, 1);

