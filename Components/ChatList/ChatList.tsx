import ChatCard from "./ChatCard";
import styles from "../../styles/ChatList.module.css";
import React, { useEffect } from "react";

export default function ChatList(props) {
  let chatFetching = false;
  const chatElems = [];
  const [forceRefresh, changeForceRefresh] = React.useState(0);

  async function fetchChats() {
    if (chatFetching) return;

    chatFetching = true;

    try {
      const response = await (
        await fetch(`/api/getChat`, {
          method: "POST"
        })
      ).json();

      if (response.length != props.data.length) {
        // @todo refactor this
        props.data.length = 0;
        props.data.push(...response);
        changeForceRefresh(forceRefresh + 1);
      } else {
        for (let i = 0; i < response.length; i++) {
          if (
            response[i].sender_id != props.data[i].sender_id ||
            response[i].id != props.data[i].id ||
            response[i].unread_count != props.data[i].unread_count
          ) {
            // @todo refactor
            props.data.length = 0;
            props.data.push(...response);
            changeForceRefresh(forceRefresh + 1);
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }

    chatFetching = false;
  }

  useEffect(() => {
    const id = setInterval(fetchChats, 3000);

    return () => {
      clearInterval(id);
    };
  }, [forceRefresh]);

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

  return <div className={styles.chatListCon}>{chatElems}</div>;
}
