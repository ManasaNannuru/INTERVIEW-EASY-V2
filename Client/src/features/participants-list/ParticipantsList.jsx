import { ListItemText } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useContext } from "react";
import { SocketContext } from "../../socket-context";
import { UserDetailsContext } from "../../user-context";
import "./ParticipantsList.css";

export const ParticipantsList = () => {
  const [ownUserInfo] = useContext(UserDetailsContext);
  const { otherUserInfo } = useContext(SocketContext);

  return (
    <List className="participants-list">
      <ListItem>
        <ListItemText primary={ownUserInfo.userName} />
      </ListItem>
      {otherUserInfo && (
        <ListItem>
          <ListItemText primary={otherUserInfo?.userName} />
        </ListItem>
      )}
    </List>
  );
};
