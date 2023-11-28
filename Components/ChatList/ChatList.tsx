import ChatCard from "./ChatCard";
import styles from "../../styles/ChatList.module.css";
import stylesPop from "../../styles/next.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Flipper, Flipped } from "react-flip-toolkit";
import GroupAdd from "@mui/icons-material/GroupAdd";

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";

async function createGroup(name: string) {
  if (!name) return;

  const response = await fetch("/api/createGroup", {
    method: "POST",
    body: JSON.stringify({
      name
    })
  });
}

export default function ChatList(props) {
  let chatFetching = false;
  const [forceRefresh, changeForceRefresh] = React.useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const groupName = useRef(null);
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

  return (
    <Flipper flipKey={props.data.map((x) => x.sender_id).join(",")} className={styles.chatListCon}>
      <div>
        <Popover
          isOpen={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          placement="bottom"
          backdrop="blur"
          classNames={{
            content: [stylesPop.popover]
          }}
        >
          <PopoverTrigger>
            <Button>
              <GroupAdd
                className={styles.topIcon}
                onClick={() => {
                  setIsOpen(true);
                }}
              ></GroupAdd>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Input ref={groupName} placeholder="Group name" />
            <Button
              className={styles.createGroupButton}
              color="primary"
              onClick={() => {
                createGroup(groupName.current.value);
                setIsOpen(false);
              }}
            >
              Add
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      {props.data.map((chatData) => (
        <Flipped
          key={`${chatData.is_group}-${chatData.sender_id}`}
          flipId={`${chatData.is_group}-${chatData.sender_id}`}
        >
          <div>
            <ChatCard
              id={chatData.sender_id}
              username={chatData.username}
              time={chatData.created_at}
              message={chatData.message}
              unreadCount={chatData.unread_count}
              isGroup={chatData.is_group}
            ></ChatCard>
          </div>
        </Flipped>
      ))}
    </Flipper>
  );
}
