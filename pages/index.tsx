import "../styles/Home.module.css";
import ChatList from "../Components/ChatList/ChatList";
import React, { useEffect, useState } from "react";
import Chat from "../Components/ChatList/Chat";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import { getUserIdByCookie } from "../Components/helper";
import SearchPanel from "../Components/SearchPanel";

export const getServerSideProps = async (context) => {
  const userId = Number(await getUserIdByCookie(context.req.cookies["X-Auth-Token"]));

  return {
    props: {
      userId // Not used for authentication (that'd be a bad idea)
      // It's solely used to align the messages correctly
      // so it isn't a security issue if it's changed on
      // the client
    }
  };
};

function getMessageId(messageId: string | null) {
  if (!messageId) return -1;
  if (isNaN(parseInt(messageId))) return -1;

  return parseInt(messageId);
}

export default function Home(props) {
  const router = useRouter();
  const [chatConfig, changeChatConfig] = useState({
    chatId: Number(router.query.chat),
    isGroup: router.query.isGroup === "true",
    messageId: getMessageId(router.query.messageId as string)
  });
  const [isSearchOpen, changeSearch] = useState(false);

  function openSearch() {
    changeSearch(true);
  }

  function closeSearch() {
    changeSearch(false);
  }

  useEffect(() => {
    router.events.on("routeChangeStart", (url, obj) => {
      url.startsWith("/") && (url = url.substring(1));
      const params = new URLSearchParams(url);
      changeChatConfig({
        chatId: Number(params.get("chat")),
        isGroup: params.get("isGroup") === "true",
        messageId: getMessageId(params.get("messageId"))
      });
    });
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex"
      }}
    >
      <ToastContainer draggable pauseOnHover theme="dark" />

      <ChatList></ChatList>

      {!!chatConfig.chatId && (
        <Chat
          data={[]}
          config={{
            chatId: chatConfig.chatId,
            userId: Number(props.userId),
            messageId: chatConfig.messageId,
            editId: -1,
            isGroup: chatConfig.isGroup,
            scrollToBottom: true
          }}
          openSearch={openSearch}
        ></Chat>
      )}

      {isSearchOpen && (
        <SearchPanel
          closeSearch={closeSearch}
          recipientId={chatConfig.chatId}
          isGroup={chatConfig.isGroup}
          userId={Number(props.userId)}
        ></SearchPanel>
      )}
    </div>
  );
}
