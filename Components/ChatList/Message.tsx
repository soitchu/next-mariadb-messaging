import styles from "../../styles/Message.module.css";
import { openContextMenu } from "../ContextMenu";
import { dateToHuman } from "../helperClient";

function handleClick(event) {
  console.log(event.currentTarget.classList.contains(styles.right));
  localStorage.setItem("delete-message", (event.currentTarget.dataset.id));
  openContextMenu(event);
}

// function MessageElem() {
export default function Message({ content, time, align, id }) {
  return (
    <div className={styles.message + " " + styles[align]} data-id={id} onContextMenu={handleClick}>
      {content}
      <div className={styles.time}>
        {dateToHuman(time)}
      </div>
    </div>
  );
}

// export default function Message({ content, time, align, id }) {
//   return (
//     <MessageElem />
//   );
// }
