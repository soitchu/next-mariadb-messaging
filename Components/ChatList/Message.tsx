import remarkGfm from "remark-gfm";
import styles from "../../styles/Message.module.css";
import { binarySearch, dateToHuman } from "../helperClient";
import Markdown from "react-markdown";
import { Menu, Item, Separator, Submenu, useContextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";
import { toast } from "react-toastify";

async function deleteMessage(messageId: string, chatId: string, cb: Function, isGroup: boolean) {
  // @todo toast the error message
  const response = await fetch("/api/deleteMessage", {
    method: "POST",
    body: JSON.stringify({
      messageId,
      recipientId: chatId,
      isGroup
    })
  });

  if (response.ok) {
    cb(messageId);
  } else {
    // @todo toast the error message
  }
}

export default function Message({
  content,
  time,
  align,
  id,
  repliesTo,
  chatId,
  username,
  deleteFunction,
  setReply,
  isGroup,
  editMessage
}) {
  const { show } = useContextMenu({
    id: `message-${id}`
  });

  const handleContextMenu = function (event) {
    show({
      event
    });
  };

  return (
    <>
      <div
        className={styles.message + " " + styles[align]}
        data-id={id}
        onContextMenu={handleContextMenu}
      >
        {username && <div className={styles.time}>{username}</div>}
        {repliesTo && (
          <div className={styles.reply}>
            <Markdown remarkPlugins={[remarkGfm]}>{repliesTo}</Markdown>
          </div>
        )}
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        <div className={styles.time}>{dateToHuman(time)}</div>
      </div>

      <Menu theme={"dark"} id={`message-${id}`}>
        <Item onClick={() => setReply(id)}>Reply</Item>
        {align === "right" && (
          <Item onClick={() => deleteMessage(id, chatId, deleteFunction, isGroup)}>Delete</Item>
        )}
        {align === "right" && <Item onClick={() => editMessage(id, content)}>Edit</Item>}
      </Menu>
    </>
  );
}
