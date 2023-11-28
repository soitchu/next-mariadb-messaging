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
      console.log(response);
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
      <Popover
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        backdrop="blur"
        classNames={{
          content: [stylesNext.popover]
        }}
      >
        <PopoverTrigger>
          <Button style={{ minWidth: "30px" }}>
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
    </div>
  );
}
