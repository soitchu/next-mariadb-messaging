import { useEffect, useRef } from "react";
import styles from "../../styles/Chat.module.css";
import Message from "./Message";
import { Menu, MenuItem, openContextMenu } from "../ContextMenu";
import React from "react";


async function sendMessage(message: string, recipientId: number) {
  const response = await fetch("/api/sendMessage", {
    method: "POST",
    body: JSON.stringify({
      message,
      recipientId
    })
  });

  if (response.ok) {
    return;
  } else {
    throw Error("Could not send the message");
  }
}

export default function Chat(props) {
  const messageElems = [];
  const containerElem = useRef(null);

  const [oldestId, changeOldestId] = React.useState(props.data[props.data.length - 1]?.id ?? -1);
  const [newestId, changeNewestId] = React.useState(props.data[0]?.id ?? -1);
  let fetching = false;
  let newFetching = false;

  for (const messageData of props.data) {
    messageElems.push(
      <Message
        key={messageData.id}
        content={messageData.message}
        align={messageData.recipient_id === 1 ? "left" : "right"}
        time={messageData.created_at}
        id={messageData.id}
      ></Message>
    );
  }

  messageElems.reverse();

  async function fetchNewMessages() {
    console.log(newFetching);
    if (newFetching) return;

    newFetching = true;

    try {
      const response = await fetch(`/api/getLastId?sender_id=${props.config.chatId}`, {
        method: "GET",
      });

      const serverNewestId = (await response.json()).id;
      if (newestId < serverNewestId) {

        const newMessages = await (await fetch("/api/getMessages", {
          method: "POST",
          body: JSON.stringify({
            recipientId: props.config.chatId,
            oldestId: newestId,
            greater: "true"
          })
        })).json();

        props.data.unshift(...newMessages.reverse());

        console.log(newMessages);
        changeNewestId(newMessages[0].id);
        props.config.scrollToBottom = true;
      } else {
        newFetching = false;
      }

    } catch (err) {
      newFetching = false;
      console.error(err);
    }
  }


  async function fetchOldMessages() {
    if (fetching) return;

    fetching = true;
    try {

      const response = await fetch("/api/getMessages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: props.config.chatId,
          oldestId
        })
      });


      props.data.push(...await response.json());
      changeOldestId(props.data[props.data.length - 1].id);
    } catch (err) {
      fetching = false;
      console.error(err);
    }
  }

  const messageContainer = <div
    style={{
      maxHeight: "calc(100% - 60px)",
      overflowY: "auto"
    }}
    ref={containerElem}
    onScroll={function (event) {
      if (containerElem.current.scrollTop < 400) {
        fetchOldMessages();
      }
    }}
  >
    {messageElems}
  </div>;


  useEffect(() => {

    // @todo: change this to setTimeout
    // let brk = false;
    // async function checkNewMessage() {
    //   await new Promise(r => setTimeout(r, 2000));

    //   if (brk) return;

    //   await fetchNewMessages();
    //   checkNewMessage();
    // }

    const id = setInterval(fetchNewMessages, 3000);

    if (props.config.scrollToBottom == true) {
      containerElem.current.scrollTop = containerElem.current.scrollHeight + 100;
      props.config.scrollToBottom = false;
    }

    return () => {
      console.log("cleared");
      clearInterval(id);
    };

  }, [messageElems.length])

  // onClick={function (event) {
  //   openContextMenu(event);
  // }}
  return (
    <div className={styles.chatCon}>
      {messageContainer}

      <Menu>
        <MenuItem label="Back" onClick={function (event) {
          console.log(event)
        }} />
        <MenuItem label="Forward" />
        <MenuItem label="Reload" disabled />
        <MenuItem label="Save As..." />
        <MenuItem label="Print" />
      </Menu>

      <input
        className={styles.messageBox}
        onKeyDown={async function (event) {
          if (event.key === "Enter" && !event.altKey && !event.ctrlKey) {
            const message = (event.target as HTMLInputElement).value;
            await sendMessage(message, props.config.chatId);
            (event.target as HTMLInputElement).value = "";
            await fetchNewMessages();
          }
        }}
      ></input>
    </div>
  );
}
