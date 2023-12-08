import ChatCard from "./ChatCard";
import styles from "../../styles/ChatList.module.css";
import stylesPop from "../../styles/next.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Flipper, Flipped } from "react-flip-toolkit";
import GroupAdd from "@mui/icons-material/GroupAdd";

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { ManageAccounts } from "@mui/icons-material";
import { toast } from "react-toastify";

async function createGroup(name: string) {
  if (!name) return;
  // @todo: toast
  const response = await fetch("/api/createGroup", {
    method: "POST",
    body: JSON.stringify({
      name
    })
  });
}

async function changeUsername(username: string) {
  if (!username) return;
  // @todo: toast

  const response = await fetch("/api/changeUsername ", {
    method: "POST",
    body: JSON.stringify({
      username
    })
  });

  if (response.ok) {
    toast.success("Done!");
    location.reload();
  } else {
    toast.error((await response.json()).message);
  }

  // location.reload();
}

export default function ChatList(props) {
  let chatFetching = false;
  const [forceRefresh, changeForceRefresh] = React.useState(1);

  const [isGroupAddOpen, setGroupAddOpen] = useState(false);
  const [ischangeUserOpen, setChangeUserOpen] = useState(false);
  const [chatData, changeChatData] = useState([]);
  const [loaded, changeLoaded] = useState(false);

  const groupName = useRef(null);
  const username = useRef(null);

  async function fetchChats() {
    if (chatFetching) return;

    chatFetching = true;

    try {
      const response = await (
        await fetch(`/api/getChat`, {
          method: "POST"
        })
      ).json();

      // console.log(response, props.data);
      if (response.length != chatData.length) {
        // @todo refactor this
        // props.data.length = 0;
        // props.data.push(...response);
        // console.log(props.data);
        changeChatData(response);
      } else {
        for (let i = 0; i < response.length; i++) {
          if (
            response[i].sender_id != chatData[i].sender_id ||
            response[i].id != chatData[i].id ||
            response[i].unread_count != chatData[i].unread_count
          ) {
            // @todo refactor
            // props.data.length = 0;
            // props.data.push(...response);
            changeChatData(response);
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
    if (loaded === false) {
      (async function () {
        await fetchChats();
        changeLoaded(true);
      })();
    }
    const id = setInterval(fetchChats, 3000);

    return () => {
      clearInterval(id);
    };
  }, [chatData]);

  return (
    <Flipper flipKey={chatData.map((x) => x.sender_id).join(",")} className={styles.chatListCon}>
      <div
        style={{
          textAlign: "left",
          padding: "10px"
        }}
      >
        <Popover
          isOpen={isGroupAddOpen}
          onOpenChange={(open) => setGroupAddOpen(open)}
          placement="bottom"
          backdrop="blur"
          classNames={{
            content: [stylesPop.popover]
          }}
        >
          <PopoverTrigger className={styles.createGroupButton}>
            <Button
              style={{
                minWidth: "50px",
                padding: "0"
              }}
            >
              <GroupAdd
                className={styles.topIcon}
                onClick={() => {
                  setGroupAddOpen(true);
                }}
              ></GroupAdd>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Input ref={groupName} placeholder="Group name" />
            <Button
              color="primary"
              onClick={() => {
                createGroup(groupName.current.value);
                setGroupAddOpen(false);
              }}
            >
              Add
            </Button>
          </PopoverContent>
        </Popover>

        <Popover
          isOpen={ischangeUserOpen}
          onOpenChange={(open) => setChangeUserOpen(open)}
          placement="bottom"
          backdrop="blur"
          classNames={{
            content: [stylesPop.popover]
          }}
        >
          <PopoverTrigger className={styles.createGroupButton}>
            <Button
              style={{
                minWidth: "50px",
                marginLeft: "10px",
                padding: "0"
              }}
            >
              <ManageAccounts
                className={styles.topIcon}
                onClick={() => {
                  setChangeUserOpen(true);
                }}
              ></ManageAccounts>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Input ref={username} placeholder="Enter your new username" />
            <Button
              style={{ marginTop: "10px" }}
              color="primary"
              onClick={() => {
                changeUsername(username.current.value);
                setChangeUserOpen(false);
              }}
            >
              Change
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      {chatData.map((chatData) => (
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
