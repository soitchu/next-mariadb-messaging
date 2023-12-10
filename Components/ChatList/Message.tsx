import { Menu, Item, Separator, Submenu, useContextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";
import { toast } from "react-toastify";
import { CoreMessage } from "./CoreMessage";

async function deleteMessage(messageId: string, chatId: string, cb: Function, isGroup: boolean) {
  // @todo toast the error message
  const response = await fetch("/api/deleteMessage", {
    method: "POST",
    body: JSON.stringify({
      messageId,
      recipientId: chatId,
      isGroup
    })
  });

  if (response.ok) {
    cb(messageId);
  } else {
    // @todo toast the error message
  }
}

export default function Message({
  content,
  time,
  align,
  id,
  repliesTo,
  chatId,
  username,
  deleteFunction,
  setReply,
  isGroup,
  editMessage,
  reference
}) {
  const { show } = useContextMenu({
    id: `message-${id}`
  });

  const handleContextMenu = function (event) {
    show({
      event
    });
  };

  return (
    <>
      <CoreMessage
        time={time}
        repliesTo={repliesTo}
        username={username}
        reference={reference}
        content={content}
        handleContextMenu={handleContextMenu}
        align={align}
        id={id}
      ></CoreMessage>

      <Menu theme={"dark"} id={`message-${id}`}>
        <Item onClick={() => setReply(id)}>Reply</Item>
        {align === "right" && (
          <Item onClick={() => deleteMessage(id, chatId, deleteFunction, isGroup)}>Delete</Item>
        )}
        {align === "right" && <Item onClick={() => editMessage(id, content)}>Edit</Item>}
      </Menu>
    </>
  );
}
