import { getChats, getMessages, init } from "../api";
import "../styles/Home.module.css";
import ChatList from "../Components/ChatList/ChatList";
import React from "react";
import Chat from "../Components/ChatList/Chat";
import { getUserIdByCookie } from "../Components/helper";

export const getServerSideProps = async (context) => {
  await init();
  const userId = Number(await getUserIdByCookie(context.req.cookies["X-Auth-Token"]));
  const chats = await getChats(userId);
  let messages = [];

  try {
    messages = await getMessages(userId, context.query.chat, Infinity);
  } catch (err) {}

  return {
    props: {
      chats,
      messages,
      chatId: context.query.chat ?? -1,
      userId // Not used for authentication (that'd be a bad idea)
      // It's solely used to align the messages correctly
      // so it isn't a security issue if it's changed on
      // the client
    }
  };
};

export default function Home(props) {
  // const router = useRouter();
  // console.log(router);
  // if (router.pathname.startsWith("/500")) {
  //   return Custom500();
  // }

  // if (router.pathname.startsWith("/404")) {
  //   return Custom404();
  // }

  // if (router.pathname.startsWith("/login")) {
  //   return Login();
  // }

  return (
    <div
      style={{
        height: "100%"
      }}
    >
      <ChatList data={...props.chats} test={10}></ChatList>

      {props.chatId && (
        <Chat
          data={...props.messages}
          config={{
            chatId: props.chatId,
            userId: Number(props.userId),
            editId: -1,
            scrollToBottom: true
          }}
        ></Chat>
      )}
    </div>
  );
}
