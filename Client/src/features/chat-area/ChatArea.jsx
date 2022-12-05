import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useCallback, useState } from "react";
import "./ChatArea.css";
import { useContext } from "react";
import { SocketContext } from "../../socket-context";
import { onNewMessage } from "../../socket-context/EventEmitters";
import { UserDetailsContext } from "../../user-context";
import { useEffect } from "react";

export const ChatArea = () => {
  const { messages } = useContext(SocketContext);
  const [ownUserInfo] = useContext(UserDetailsContext);
  const [message, setMessage] = useState("");

  const handleMessageChange = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const onEnter = useCallback(() => {
    if (message) {
      onNewMessage(message, ownUserInfo.userName);
      setMessage("");
    }
  }, [message, ownUserInfo]);

  useEffect(() => {
    let elem = document.getElementById("messages");
    elem.scrollTop = elem.scrollHeight;
  }, [messages]);

  return (
    <>
      <div className="chat-header">Chat</div>
      <Paper className="chat-area">
        <div className="messages" id="messages">
          {messages?.map((messageObj) => {
            return (
              <div
                className={
                  messageObj.userName === ownUserInfo.userName
                    ? "right"
                    : "left"
                }
              >
                {messageObj.message}
              </div>
            );
          })}
        </div>
        <OutlinedInput
          className="message-input"
          value={message}
          onChange={handleMessageChange}
          onSubmit={onEnter}
          endAdornment={
            <InputAdornment>
              <IconButton onClick={onEnter} edge="end">
                <SendRoundedIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </Paper>
    </>
  );
};
