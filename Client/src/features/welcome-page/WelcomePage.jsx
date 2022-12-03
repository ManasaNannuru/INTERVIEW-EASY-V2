import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./welcome-page.css";

export const WelcomePage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState();
  const [roomID, setRoomID] = useState("");

  const onRoomIDChange = useCallback((event) => {
    setRoomID(event.target.value);
  }, []);

  const onClickingCreateMeeting = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onJoinMeeting = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCancelDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOkDialog = useCallback(() => {
    navigate(`/room/${roomID}`);
  }, [navigate, roomID]);

  return (
    <div className="welcome-page">
      <Button variant="contained" onClick={onClickingCreateMeeting}>
        Create Meeting
      </Button>
      <Button variant="contained" onClick={onJoinMeeting}>
        Join Meeting
      </Button>
      <Dialog open={open} onClose={handleCancelDialog}>
        <DialogTitle>Join Room</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            label="Room ID"
            required
            size="small"
            margin="normal"
            type="input"
            value={roomID}
            onChange={onRoomIDChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Cancel</Button>
          <Button onClick={handleOkDialog} autoFocus disabled={!roomID}>
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
