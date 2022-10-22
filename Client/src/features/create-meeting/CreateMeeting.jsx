import { Box, Button, TextField } from "@mui/material";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateMeeting.css";

export const CreateMeeting = () => {
  const navigate = useNavigate();
  const onCreateMeetingRoomClick = useCallback(() => {
    navigate("/room");
  }, [navigate]);

  return (
    <Box className="CreateMeeting">
      <TextField
        variant="outlined"
        label="Email ID"
        required
        size="small"
        margin="normal"
        type="email"
      />
      <TextField
        variant="outlined"
        label="User Name"
        required
        size="small"
        margin="normal"
      />
      <Button
        variant="contained"
        size="large"
        onClick={onCreateMeetingRoomClick}
      >
        Create Meeting
      </Button>
    </Box>
  );
};
