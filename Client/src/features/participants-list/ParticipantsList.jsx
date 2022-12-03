import { ListItemText } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import "./ParticipantsList.css";

export const ParticipantsList = ({ users }) => {
  return (
    <List className="participants-list">
      {users.map((userName) => {
        return (
          <ListItem>
            <ListItemText primary={userName} />
          </ListItem>
        );
      })}
    </List>
  );
};
