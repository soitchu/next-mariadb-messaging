import { useEffect, useRef } from "react";
import styles from "../../styles/Chat.module.css";
import Message from "./Message";
import React from "react";
import { binarySearch } from "../helperClient";
import CancelIcon from "@mui/icons-material/Cancel";
import ChatTopMenu from "./ChatTopMenu";
import io from "socket.io-client";

async function sendMessage(message: string, recipientId: number, replyId: number, isGroup: number) {
  if (!message || !message?.trim()) return;

  const response = await fetch("/api/sendMessage", {
    method: "POST",
    body: JSON.stringify({
      message,
      recipientId,
      replyId,
      isGroup
    })
  });

  if (response.ok) {
    return;
  } else {
    // @todo toast the error
    throw Error("Could not send the message");
  }
}

async function editMessage(message: string, messageId: number, isGroup: boolean, messageData) {
  if (!message || !message?.trim()) return;
  const response = await fetch("/api/editMessage", {
    method: "POST",
    body: JSON.stringify({
      message,
      messageId,
      isGroup
    })
  });

  if (response.ok) {
    const messageIndex = binarySearch(messageData, Number(messageId));
    if (messageIndex !== -1) {
      messageData[messageIndex].message = message;
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
  const messageLookUp = {};
  const [messageData, changeMessageData] = React.useState({
    messages: [],
    oldestId: -1,
    newestId: 0
  });

  const [forceRefresh, changeForceRefresh] = React.useState(0);
  const [replyId, changeReplyId] = React.useState(-1);
  const [editMode, changeEditMode] = React.useState(false);
  const [selectedRef, changeSelectedRef] = React.useState(useRef(null));

  let fetching = false;
  let newFetching = false;
  let chatFetching = false;

  function deleteMessageCb(messageId: string) {
    const messageIndex = binarySearch(messageData.messages, Number(messageId));
    if (messageIndex !== -1) {
      messageData.messages.splice(messageIndex, 1);
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

  const isGroup = props.config.isGroup;

  for (const messageObj of messageData.messages) {
    // @todo refactor and optimise this abomination
    if (messageObj.id in messageLookUp) continue;
    const messageElem = (
      <Message
        {...(messageObj.id === props.config.messageId
          ? { reference: selectedRef }
          : { reference: null })}
        key={messageObj.id}
        content={messageObj.message}
        align={
          messageObj[isGroup ? "sender_id" : "recipient_id"] === props.config.userId
            ? isGroup
              ? "right"
              : "left"
            : isGroup
            ? "left"
            : "right"
        }
        username={messageObj.username}
        time={messageObj.created_at}
        id={messageObj.id}
        repliesTo={messageObj.reply_message}
        chatId={props.config.chatId}
        deleteFunction={deleteMessageCb}
        setReply={replyTo}
        editMessage={editMessageCb}
        isGroup={isGroup}
      ></Message>
    );

    messageLookUp[messageObj.id] = messageElem;
    messageElems.push(messageElem);
  }

  messageElems.reverse();

  async function fetchNewMessages(forceFetch = false, newestId = -1) {
    if (props.config.messageId !== -1 && !forceFetch) return;
    if (newFetching) return;

    newFetching = true;

    try {
      const response = await fetch(
        `/api/getLastId?sender_id=${props.config.chatId}&isGroup=${props.config.isGroup}`,
        {
          method: "GET"
        }
      );

      const serverNewestId = (await response.json()).id;
      if (messageData.newestId < serverNewestId) {
        const newMessages = await (
          await fetch("/api/getMessages", {
            method: "POST",
            body: JSON.stringify({
              recipientId: props.config.chatId,
              oldestId: newestId === -1 ? messageData.newestId : newestId,
              greater: "true",
              isGroup: props.config.isGroup
            })
          })
        ).json();

        if (newMessages.length !== 0) {
          newMessages.reverse();
          messageData.messages.unshift(...newMessages);

          changeMessageData({
            messages: messageData.messages,
            newestId: newMessages[0].id,
            oldestId: messageData.oldestId
          });

          props.config.scrollToBottom = true;
        }
      } else {
        newFetching = false;
      }
    } catch (err) {
      newFetching = false;
      console.error(err);
    }
  }

  async function fetchOldMessages(iniFetch: boolean = false, messageId: number = -1) {
    if (fetching) return;
    fetching = true;
    try {
      const response = await (
        await fetch("/api/getMessages", {
          method: "POST",
          body: JSON.stringify({
            recipientId: props.config.chatId,
            oldestId: iniFetch ? (messageId === -1 ? -1 : messageId + 1) : messageData.oldestId,
            isGroup: props.config.isGroup
          })
        })
      ).json();

      const newMessageData = {
        messages: messageData.messages,
        newestId: messageData.newestId,
        oldestId: messageData.oldestId
      };

      if (iniFetch) {
        newMessageData.messages = response;
        messageData.messages = response;
      } else {
        newMessageData.messages.push(...response);
      }

      if (response.length > 0) {
        newMessageData.oldestId = response[response.length - 1]?.id;

        if (iniFetch) {
          newMessageData.newestId = response[0].id;
        }
      }

      changeMessageData(newMessageData);
    } catch (err) {
      console.error(err);
    } finally {
      fetching = false;
    }
  }

  const messageContainer = (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        scrollBehavior: "smooth"
      }}
      ref={containerElem}
      onScroll={function (event) {
        if (containerElem.current.scrollTop < 400) {
          if (props.config.messageId === -1) {
            fetchOldMessages();
          }
        }
      }}
    >
      {messageElems}
    </div>
  );

  useEffect(() => {
    console.log("newestID useffect", selectedRef.current);
  }, [messageData.newestId, messageData.oldestId, messageData.messages, props.config.messageId]);

  // This makes sure that the fetchNewMessages has the updated
  // state values
  useEffect(() => {
    const id = setInterval(fetchNewMessages, 3000);

    const scrollHeight = containerElem.current.scrollHeight;
    containerElem.current.scrollTop = scrollHeight + 100;

    return () => {
      // socket.disconnect();
      clearInterval(id);
    };

    // const socket = io({
    //   path: "/api/socket"
    // });
    // socket.on("message", (message) => {
    //   console.log(message);
    // });
  }, [messageData.newestId]);

  useEffect(() => {
    (async function () {
      await fetchOldMessages(true, props.config.messageId);

      if (props.config.messageId !== -1) {
        messageData.newestId = 0;
        await fetchNewMessages(true, props.config.messageId);
        setTimeout(() => {
          if (props.config.messageId !== -1) {
            selectedRef.current?.scrollIntoView();
          }
        }, 200);
      } else {
        setTimeout(() => {
          const scrollHeight = containerElem.current.scrollHeight;
          containerElem.current.scrollTop = scrollHeight + 100;
        }, 200);
      }
    })();
  }, [props.config.chatId, props.config.messageId]);

  return (
    <div className={styles.chatCon}>
      <ChatTopMenu
        config={{ selectedUserId: -1 }}
        isGroup={props.config.isGroup}
        chatId={Number(props.config.chatId)}
        openSearch={props.openSearch}
      ></ChatTopMenu>
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
                await sendMessage(message, props.config.chatId, replyId, props.config.isGroup);
                await fetchNewMessages();
              } else {
                await editMessage(message, props.config.editId, props.config.isGroup, messageData);
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
