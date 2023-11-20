import { useEffect } from 'react';
import { getChats, getMessages, init } from '../api';
import '../styles/Home.module.css';
import ChatList from '../Components/ChatList/ChatList';
import { useRouter } from 'next/router';
import React from 'react';
import Chat from '../Components/ChatList/Chat';
import Custom500 from './500';
import Custom404 from './404';

export const getServerSideProps = (async (context) => {
  await init();
  const chats = await getChats();
  const messages = await getMessages(1, context.query.chat, Infinity);

  return {
    props: {
      chats,
      messages,
      chatId: context.query.chat
    }
  }
});

export default function Home(props) {
  const router = useRouter();
  if (router.pathname.startsWith("/500")) {
    return Custom500();
  }

  if (router.pathname.startsWith("/404")) {
    return Custom404();
  }
  return (
    <div style={{
      "height": "100%"
    }}>
      <ChatList
        data={...props.chats}
        test={10}
      >
      </ChatList>

      <Chat
        data={...props.messages}
        config={{
          chatId: props.chatId,
          scrollToBottom: true
        }}
      ></Chat>
    </div>
  );
}
