import styles from "../../styles/ChatCard.module.css";
import { Router, useRouter } from "next/router";
import { dateToHuman } from "../helperClient";
import { Button } from "@nextui-org/react";

interface CardParams {
  username: string;
  time: string;
  message: string;
  id: string;
  unreadCount: number;
  isGroup: 1 | 0;
}

export default function ChatCard({
  username,
  time,
  message,
  id,
  unreadCount,
  isGroup
}: CardParams) {
  const router = useRouter();
  return (
    <Button
      className={styles.card}
      onClick={() => {
        if (isGroup === 1) {
          router.push({
            query: { chat: id, isGroup: true }
          });
        } else {
          router.push({
            query: { chat: id }
          });
        }
        // window.location.reload();
      }}
    >
      <div className={styles.pfpCon}>
        <div className={styles.pfp}></div>
      </div>
      <div className={styles.info}>
        <div className={styles.username}>{username}</div>
        <div className={styles.message}>{message}</div>
      </div>
      <div className={styles.time}>
        {dateToHuman(time)}
        <div
          className={styles.unread}
          style={{
            display: unreadCount === 0 ? "none" : "flex"
          }}
        >
          {unreadCount}
        </div>
      </div>
    </Button>
  );
}
