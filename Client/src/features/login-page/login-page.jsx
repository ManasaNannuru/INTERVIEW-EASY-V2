import { Box, Button, TextField } from "@mui/material";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid4 } from "uuid";
import "./login-page.css";

export const LoginPage = ({ setRoomID, setUserInfo, roomID }) => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const onSubmit = useCallback(() => {
    setUserInfo({ userName, email });
    if (roomID) {
      navigate(`/room/${roomID}`);
    } else {
      const newRoomID = uuid4();
      setRoomID(newRoomID);
      navigate(`/room/${newRoomID}`);
    }
  }, [setUserInfo, userName, email, roomID, navigate, setRoomID]);

  const onEmailChange = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const onUserNameChange = useCallback((event) => {
    setUserName(event.target.value);
  }, []);

  return (
    <Box className="LoginPage">
      <TextField
        variant="outlined"
        label="Email ID"
        required
        size="small"
        margin="normal"
        type="email"
        value={email}
        onChange={onEmailChange}
      />
      <TextField
        variant="outlined"
        label="User Name"
        required
        size="small"
        margin="normal"
        value={userName}
        onChange={onUserNameChange}
      />
      <Button variant="contained" size="large" onClick={onSubmit}>
        {roomID ? "Join Meeting" : "Create Meeting"}
      </Button>
    </Box>
  );
};
