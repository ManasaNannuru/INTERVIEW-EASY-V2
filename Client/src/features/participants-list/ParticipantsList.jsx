import { ListItemText } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useState } from "react";
import { useEffect } from "react";
import "./ParticipantsList.css";

export const ParticipantsList = ({ socket }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    socket.on("list-of-users-updated", (updatedUsersList) => {
      const updatedUsers = [];
      for (let user in updatedUsersList) {
        updatedUsers.push(user);
      }
      setUsers(updatedUsers);
    });
  }, [socket]);
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
