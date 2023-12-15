import {
  Input,
  Button,
  Popover,
  PopoverTrigger,
  Autocomplete,
  PopoverContent,
  Checkbox,
  Spacer
} from "@nextui-org/react";
import styles from "../styles/SearchPanel.module.css";
import SearchIcon from "@mui/icons-material/Search";
import { Close, FilterList } from "@mui/icons-material";
import { MutableRefObject, useRef, useState } from "react";
import { CoreMessage } from "./ChatList/CoreMessage";
import { useRouter } from "next/router";
import stylesNext from "../styles/next.module.css";

async function search(
  message: any,
  recipientId: number,
  isGroup: boolean,
  changeMessages: Function
) {
  const response = await fetch("/api/search", {
    method: "POST",
    body: JSON.stringify({
      params: message,
      recipientId,
      isGroup
    })
  });

  changeMessages(await response.json());

  if (response.ok) {
    return;
  } else {
    // @todo toast the error
    throw Error("Something went wrong");
  }
}

function getDate(date: string) {
  try {
    return new Date(date).toISOString();
  } catch (err) {
    return undefined;
  }
}

export default function SearchPanel(props) {
  const inputRef = useRef(null);
  const [messages, changeMessages] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const checkBox = useRef(null);
  const [fromMinute, toHour, toMinute] = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const fromHour = useRef(null);
  const [fromDate, toDate] = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const searchParam = useRef({
    time: {
      from: {
        hour: null,
        minute: null
      },
      to: {
        hour: null,
        minute: null
      }
    },
    date: {
      from: null,
      to: null
    },
    isReply: false,
    message: "",
    timezoneOffset: new Date().getTimezoneOffset()
  });

  return (
    <div className={styles.container}>
      <div className={styles.inputCon}>
        <Button
          className={styles.button}
          onClick={() => {
            props.closeSearch();
          }}
        >
          <Close htmlColor="black"></Close>
        </Button>
        <Button
          className={styles.button}
          style={{ marginLeft: "0" }}
          onClick={() => {
            searchParam.current.message = inputRef.current.value;
            search(searchParam.current, props.recipientId, props.isGroup, changeMessages);
          }}
        >
          <SearchIcon htmlColor="black"></SearchIcon>
        </Button>

        <Popover
          isOpen={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          backdrop="blur"
          classNames={{
            content: [stylesNext.popover]
          }}
        >
          <PopoverTrigger>
            <Button className={styles.button} style={{ marginLeft: 0 }}>
              <FilterList className={styles.button} htmlColor="black"></FilterList>
            </Button>
          </PopoverTrigger>
          <PopoverContent style={{ backgroundColor: "red" }}>
            <div style={{ padding: "10px" }}>
              <div
                style={{
                  marginRight: "auto",
                  padding: "10px",
                  paddingLeft: "0"
                }}
              >
                Is reply:{" "}
                <Checkbox
                  ref={checkBox}
                  isSelected={isChecked}
                  onValueChange={setIsChecked}
                ></Checkbox>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "10px",
                  justifyContent: "center",
                  width: "100%"
                }}
              >
                <div className={styles.filterLabel}>From:</div>{" "}
                <Input
                  type="date"
                  className={styles.input}
                  ref={fromDate}
                  defaultValue={searchParam.current.date.from?.split("T")[0]}
                ></Input>
                <div className={styles.filterLabel}>to: </div>
                <Input
                  type="date"
                  className={styles.input}
                  ref={toDate}
                  defaultValue={searchParam.current.date.to?.split("T")[0]}
                ></Input>
              </div>

              <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                <div className={styles.filterLabel}>Between:</div>{" "}
                <Input
                  type="number"
                  min={0}
                  max={23}
                  style={{ maxWidth: "50px" }}
                  className={styles.input}
                  ref={fromHour}
                  defaultValue={searchParam.current.time.from.hour?.toString()}
                ></Input>{" "}
                :
                <Input
                  type="number"
                  min={0}
                  max={60}
                  style={{ maxWidth: "50px" }}
                  className={styles.input}
                  ref={fromMinute}
                  defaultValue={searchParam.current.time.from.minute?.toString()}
                ></Input>
                <div className={styles.filterLabel}>and: </div>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  style={{ maxWidth: "50px" }}
                  className={styles.input}
                  ref={toHour}
                  defaultValue={searchParam.current.time.to.hour?.toString()}
                ></Input>
                :
                <Input
                  type="number"
                  min={0}
                  max={60}
                  style={{ maxWidth: "50px" }}
                  className={styles.input}
                  ref={toMinute}
                  defaultValue={searchParam.current.time.to.minute?.toString()}
                ></Input>
              </div>

              <Button
                onClick={() => {
                  searchParam.current = {
                    time: {
                      from: {
                        hour: Number(fromHour.current.value),
                        minute: Number(fromMinute.current.value)
                      },
                      to: {
                        hour: Number(toHour.current.value),
                        minute: Number(toMinute.current.value)
                      }
                    },
                    date: {
                      from: getDate(fromDate.current.value),
                      to: getDate(toDate.current.value)
                    },
                    isReply: isChecked,
                    message: inputRef.current.value,
                    timezoneOffset: new Date().getTimezoneOffset()
                  };

                  setIsOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          isClearable
          type="text"
          label="Search"
          className={styles.input}
          ref={inputRef}
          onKeyDown={async (event) => {
            if (event.key === "Enter" && !event.altKey && !event.ctrlKey && !event.shiftKey) {
              searchParam.current.message = inputRef.current.value;
              search(searchParam.current, props.recipientId, props.isGroup, changeMessages);
            }
          }}
        />
      </div>

      {messages.length === 0 ? (
        <div style={{ textAlign: "center" }}>No result :(</div>
      ) : (
        messages.map((messageObj) => {
          return (
            <CoreMessage
              key={`reply-${messageObj.id}`}
              time={messageObj.created_at}
              repliesTo={messageObj.reply_message}
              username={messageObj.username}
              content={messageObj.message}
              align={messageObj.sender_id === props.userId ? "right" : "left"}
              id={messageObj.id}
              onClick={() => {
                router.push({
                  query: {
                    chat: props.recipientId,
                    isGroup: props.isGroup,
                    messageId: messageObj.id
                  }
                });
              }}
            ></CoreMessage>
          );
        })
      )}
    </div>
  );
}
