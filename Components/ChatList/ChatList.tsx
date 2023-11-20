import ChatCard from "./ChatCard";
import styles from "../../styles/ChatList.module.css";

export default function ChatList(props) {
  const chatElems = [];
  
  for (const chatData of props.data) {
    chatElems.push(
      <ChatCard
        key={chatData.sender_id}
        id={chatData.sender_id}
        username={chatData.username}
        time={chatData.created_at}
        message={chatData.message}
        unreadCount={chatData.unread_count}
      ></ChatCard>
    );
  }

  return (
    <div className={styles.chatListCon}>
      {chatElems}
    </div>
  );
}
