import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useCallback, useState } from "react";
import "./ChatArea.css";

export const ChatArea = ({ allMessages, sendMessage, ownUserName }) => {
  const [message, setMessage] = useState("");

  const handleMessageChange = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const onEnter = useCallback(() => {
    sendMessage(message);
    setMessage("");
  }, [message, sendMessage]);

  return (
    <Paper className="chat-area">
      <div className="messages">
        {allMessages.map((messageObj) => {
          return (
            <div
              className={messageObj.userName === ownUserName ? "left" : "right"}
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
            <IconButton
              aria-label="toggle password visibility"
              onClick={onEnter}
              edge="end"
            >
              <SendRoundedIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </Paper>
  );
};
