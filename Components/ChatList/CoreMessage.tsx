import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../../styles/Message.module.css";
import { binarySearch, dateToHuman } from "../helperClient";

export function CoreMessage(props) {
  return (
    <div
      className={
        styles.message +
        " " +
        styles[props.align] +
        (props.reference !== null ? ` ${styles.highlighted}` : "")
      }
      data-id={props.id}
      ref={props.reference}
      onContextMenu={props.handleContextMenu}
      onClick={props.onClick}
    >
      {props.username && <div className={styles.time}>{props.username}</div>}
      {props.repliesTo && (
        <div className={styles.reply}>
          <Markdown remarkPlugins={[remarkGfm]}>{props.repliesTo}</Markdown>
        </div>
      )}
      <Markdown remarkPlugins={[remarkGfm]}>{props.content}</Markdown>
      <div className={styles.time}>{dateToHuman(props.time, true)}</div>
    </div>
  );
}
