import GroupAdd from "@mui/icons-material/GroupAdd";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@nextui-org/react";
import React, { useEffect } from "react";
import styles from "../../styles/Chat.module.css";
import stylesNext from "../../styles/next.module.css";
import { toast } from "react-toastify";
import { Delete, Search } from "@mui/icons-material";

async function addToGroup(userId: number, groupId: number) {
  const response = await fetch("/api/addToGroup", {
    method: "POST",
    body: JSON.stringify({
      userId,
      groupId
    })
  });

  if (response.ok) {
    toast.success("Added!");
  } else {
    toast.error((await response.json()).message);
  }
}

async function deleteGroup(groupId: number) {
  const response = await fetch("/api/deleteGroup", {
    method: "POST",
    body: JSON.stringify({
      groupId
    })
  });

  if (response.ok) {
    toast.success("Deleted!");
    location.reload();
  } else {
    toast.error((await response.json()).message);
  }
}

async function deleteChat(chatId: number) {
  const response = await fetch("/api/deleteChat", {
    method: "POST",
    body: JSON.stringify({
      chatId
    })
  });

  if (response.ok) {
    toast.success("Deleted!");
    location.reload();
  } else {
    toast.error((await response.json()).message);
  }
}

export default function ChatTopMenu(props) {
  const [userList, changeUserList] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [userId, changeUserId] = React.useState(-1);

  useEffect(() => {
    (async function () {
      const users = [];
      const response = await (
        await fetch(`/api/getChat`, {
          method: "POST"
        })
      ).json();

      for (const chatEntry of response) {
        if (chatEntry.is_group) continue;
        users.push({
          label: chatEntry.username,
          value: chatEntry.sender_id
        });
      }
      changeUserList(users);
    })();
  }, []);

  return (
    <div className={styles.topBar}>
      {props.isGroup && (
        <Popover
          isOpen={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          backdrop="blur"
          classNames={{
            content: [stylesNext.popover]
          }}
        >
          <PopoverTrigger>
            <Button style={{ minWidth: "40px", width: "40px" }}>
              <GroupAdd
                style={{
                  cursor: "pointer"
                }}
              ></GroupAdd>
            </Button>
          </PopoverTrigger>
          <PopoverContent style={{ backgroundColor: "red" }}>
            <Autocomplete
              defaultItems={userList}
              label="User"
              placeholder="Search a user"
              onSelectionChange={(value) => {
                changeUserId(Number(value));
              }}
            >
              {(users) => <AutocompleteItem key={users.value}>{users.label}</AutocompleteItem>}
            </Autocomplete>
            <Button
              color="primary"
              style={{
                marginTop: "10px"
              }}
              className={stylesNext.nextButton}
              onClick={async () => {
                await addToGroup(userId, props.chatId);
                setIsOpen(false);
              }}
            >
              Add
            </Button>
          </PopoverContent>
        </Popover>
      )}

      <Button style={{ minWidth: "40px", width: "40px", marginLeft: "10px" }}>
        <Delete
          style={{
            cursor: "pointer"
          }}
          onClick={async () => {
            const sure = confirm(
              `Are you sure that you want to delete this ${props.isGroup ? "group" : "chat"} ?`
            );
            if (sure) {
              if (props.isGroup) {
                deleteGroup(props.chatId);
              } else {
                deleteChat(props.chatId);
              }
            }
          }}
        ></Delete>
      </Button>

      <Button style={{ minWidth: "40px", width: "40px", marginLeft: "10px" }}>
        <Search
          style={{
            cursor: "pointer"
          }}
          onClick={async () => {
            props.openSearch();
          }}
        ></Search>
      </Button>
    </div>
  );
}
