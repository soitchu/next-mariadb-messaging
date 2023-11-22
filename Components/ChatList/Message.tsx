import remarkGfm from "remark-gfm";
import styles from "../../styles/Message.module.css";
import { binarySearch, dateToHuman } from "../helperClient";
import Markdown from "react-markdown";
import { Menu, Item, Separator, Submenu, useContextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";

async function deleteMessage(messageId: string, chatId: string, cb: Function) {
  // @todo toast the error message
  const response = await fetch("/api/deleteMessage", {
    method: "POST",
    body: JSON.stringify({
      messageId,
      recipientId: chatId
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
  deleteFunction,
  setReply,
  editMessage
}) {
  let handleContextMenu = (event) => {};

  if (align === "right") {
    const { show } = useContextMenu({
      id
    });

    handleContextMenu = function (event) {
      show({
        event
      });
    };
  }

  return (
    <>
      <div
        className={styles.message + " " + styles[align]}
        data-id={id}
        onContextMenu={handleContextMenu}
      >
        {repliesTo && (
          <div className={styles.reply}>
            <Markdown remarkPlugins={[remarkGfm]}>{repliesTo}</Markdown>
          </div>
        )}
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        <div className={styles.time}>{dateToHuman(time)}</div>
      </div>
      {align === "right" && (
        <Menu id={id}>
          <Item onClick={() => deleteMessage(id, chatId, deleteFunction)}>Delete</Item>
          <Item onClick={() => setReply(id)}>Reply</Item>
          <Item onClick={() => editMessage(id, content)}>Edit</Item>
        </Menu>
      )}
    </>
  );
}
