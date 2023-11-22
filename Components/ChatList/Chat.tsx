import { useEffect, useRef } from "react";
import styles from "../../styles/Chat.module.css";
import Message from "./Message";
import React from "react";
import { binarySearch } from "../helperClient";
import CancelIcon from "@mui/icons-material/Cancel";

async function sendMessage(message: string, recipientId: number, replyId: number) {
  if (!message || !message?.trim()) return;
  const response = await fetch("/api/sendMessage", {
    method: "POST",
    body: JSON.stringify({
      message,
      recipientId,
      replyId
    })
  });

  if (response.ok) {
    return;
  } else {
    // @todo toast the error
    throw Error("Could not send the message");
  }
}

async function editMessage(message: string, messageId: number, props) {
  if (!message || !message?.trim()) return;
  const response = await fetch("/api/editMessage", {
    method: "POST",
    body: JSON.stringify({
      message,
      messageId
    })
  });

  if (response.ok) {
    const messageIndex = binarySearch(props.data, Number(messageId));
    if (messageIndex !== -1) {
      props.data[messageIndex].message = message;
    }
    return;
  } else {
    // @todo toast the error
    throw Error("Could not edit the message");
  }
}

export default function Chat(props) {
  const messageElems = [];
  const containerElem = useRef(null);
  const inputElem = useRef(null);

  const [oldestId, changeOldestId] = React.useState(props.data[props.data.length - 1]?.id ?? -1);
  const [newestId, changeNewestId] = React.useState(props.data[0]?.id ?? 0);
  const [forceRefresh, changeForceRefresh] = React.useState(0);
  const [replyId, changeReplyId] = React.useState(-1);
  const [editMode, changeEditMode] = React.useState(false);

  let fetching = false;
  let newFetching = false;
  let chatFetching = false;

  function deleteMessageCb(messageId: string) {
    const messageIndex = binarySearch(props.data, Number(messageId));
    if (messageIndex !== -1) {
      props.data.splice(messageIndex, 1);
      changeForceRefresh(forceRefresh + 1);
    }
  }

  function replyTo(messageId: string) {
    const messageIdNum = Number(messageId);
    if (!isNaN(replyId)) {
      changeReplyId(messageIdNum);
    }
  }

  function editMessageCb(messageId: string, content: string) {
    changeEditMode(true);
    props.config.editId = Number(messageId);
    inputElem.current.value = content;
  }

  for (const messageData of props.data) {
    messageElems.push(
      <Message
        key={messageData.id}
        content={messageData.message}
        align={messageData.recipient_id === props.config.userId ? "left" : "right"}
        time={messageData.created_at}
        id={messageData.id}
        repliesTo={messageData.reply_message}
        chatId={props.config.chatId}
        deleteFunction={deleteMessageCb}
        setReply={replyTo}
        editMessage={editMessageCb}
      ></Message>
    );
  }

  messageElems.reverse();

  async function fetchNewMessages() {
    if (newFetching) return;

    newFetching = true;

    try {
      const response = await fetch(`/api/getLastId?sender_id=${props.config.chatId}`, {
        method: "GET"
      });

      const serverNewestId = (await response.json()).id;
      if (newestId < serverNewestId) {
        const newMessages = await (
          await fetch("/api/getMessages", {
            method: "POST",
            body: JSON.stringify({
              recipientId: props.config.chatId,
              oldestId: newestId,
              greater: "true"
            })
          })
        ).json();

        props.data.unshift(...newMessages);

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

      props.data.push(...(await response.json()));
      changeOldestId(props.data[props.data.length - 1].id);
    } catch (err) {
      fetching = false;
      console.error(err);
    }
  }

  const messageContainer = (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden"
      }}
      ref={containerElem}
      onScroll={function (event) {
        if (containerElem.current.scrollTop < 400) {
          fetchOldMessages();
        }
      }}
    >
      {messageElems}
    </div>
  );

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
      clearInterval(id);
    };
  }, [messageElems.length]);

  return (
    <div className={styles.chatCon}>
      {messageContainer}
      <div className={styles.inputCon}>
        {(replyId !== -1 || editMode) && (
          <div className={styles.replying}>
            <CancelIcon
              style={{
                verticalAlign: "middle"
              }}
              onClick={function () {
                if (editMode) {
                  changeEditMode(false);
                  inputElem.current.value = "";
                } else {
                  changeReplyId(-1);
                }
              }}
            ></CancelIcon>
            <div className={styles.replyContent}>{editMode ? "Editing" : "Replying"}</div>
          </div>
        )}
        <input
          ref={inputElem}
          className={styles.messageBox}
          onKeyDown={async function (event) {
            if (event.key === "Enter" && !event.altKey && !event.ctrlKey && !event.shiftKey) {
              const message = (event.target as HTMLInputElement).value;

              if (!editMode) {
                await sendMessage(message, props.config.chatId, replyId);
                await fetchNewMessages();
              } else {
                await editMessage(message, props.config.editId, props);
                changeEditMode(false);
              }

              (event.target as HTMLInputElement).value = "";
              changeReplyId(-1);
            }
          }}
        ></input>
      </div>
    </div>
  );
}
