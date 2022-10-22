import { Divider } from "@mui/material";
import "./MeetingRoom.css";

export const MeetingRoom = () => {
  return (
    <div className="meeting-room">
      <div className="video-area">Video</div>
      <Divider orientation="vertical" flexItem classes={{ root: "divider" }} />
      <div className="chat-and-participant-area">Chat and Participants</div>
    </div>
  );
};
