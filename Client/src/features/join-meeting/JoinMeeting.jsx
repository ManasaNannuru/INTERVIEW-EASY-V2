import { Box, Button, TextField } from "@mui/material";
import "./JoinMeeting.css";

export const JoinMeeting = () => {
  return (
    <Box className="JoinMeeting">
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
      <Button variant="contained" size="large">
        Join Meeting
      </Button>
    </Box>
  );
};
