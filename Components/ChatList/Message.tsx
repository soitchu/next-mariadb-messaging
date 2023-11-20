import styles from "../../styles/Message.module.css";
import { openContextMenu } from "../ContextMenu";

function handleClick(event) {
  const check = confirm("");
  const messageId = (event.currentTarget.dataset.id);

  fetch("/api/deleteMessage", {
    method: "POST",
    body: JSON.stringify({
      messageId,
    })
  });
}

// function MessageElem() {
export default function Message({ content, time, align, id }) {
  return (
    <div className={styles.message + " " + styles[align]} data-id={id} onClick={handleClick}>
      {content}
      <div className={styles.time}>
        {time}
      </div>
    </div>
  );
}

// export default function Message({ content, time, align, id }) {
//   return (
//     <MessageElem />
//   );
// }
