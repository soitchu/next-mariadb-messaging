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
  setReply
}) {
  function handleClick(event) {
    // if (!event.currentTarget.classList.contains(styles.right)) return;
    // localStorage.setItem("delete-message", event.currentTarget.dataset.id);
    // openContextMenu(event);
  }

  const { show } = useContextMenu({
    id
  });

  function handleContextMenu(event) {
    show({
      event
    });
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
      <Menu id={id}>
        <Item onClick={() => deleteMessage(id, chatId, deleteFunction)}>Delete</Item>
        <Item onClick={() => setReply(id)}>Reply</Item>
      </Menu>
    </>
  );
}
