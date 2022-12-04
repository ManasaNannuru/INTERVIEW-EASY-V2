import { Box, Button, TextField, Typography } from "@mui/material";
import { useContext } from "react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid4 } from "uuid";
import { UserDetailsContext } from "../../user-context";
import "./login-page.css";

export const LoginPage = ({ setRoomID, roomID }) => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isEmailValid, setValid] = useState(true);
  const [, setOwnUserInfo] = useContext(UserDetailsContext);
  const navigate = useNavigate();

  const onSubmit = useCallback(() => {
    setOwnUserInfo({ userName, email });
    if (roomID) {
      navigate(`/room/${roomID}`);
    } else {
      const newRoomID = uuid4();
      setRoomID(newRoomID);
      navigate(`/room/${newRoomID}`);
    }
  }, [setOwnUserInfo, userName, email, roomID, navigate, setRoomID]);

  const onEmailChange = useCallback((event) => {
    const isEmail = /\S+@\S+\.\S+/.test(event.target.value);
    setValid(isEmail);
    setEmail(event.target.value);
  }, []);

  const onUserNameChange = useCallback((event) => {
    setUserName(event.target.value);
  }, []);

  return (
    <div>
      <div className="LoginPage_heading">
        <Typography className="LoginPage_heading" variant="h4">
          Interview Easy
        </Typography>
      </div>
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
          error={!isEmailValid}
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
        <Button
          variant="contained"
          size="large"
          onClick={onSubmit}
          disabled={!userName || !email}
        >
          {roomID ? "Join Meeting" : "Create Meeting"}
        </Button>
      </Box>
    </div>
  );
};
