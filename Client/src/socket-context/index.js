import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { UserDetailsContext } from "../user-context";
import { initEventListeners } from "./EventListeners";

export const SocketContext = createContext({
  messages: [],
  otherUserInfo: {},
  isOtherUserSharingScreen: false,
  otherUserPeerID: undefined,
  code: "",
});

// export const socket = io("http://localhost:3001");
export const socket = io("https://interview-easy-v1-back-end.herokuapp.com");

//export const socket = io("https://interview-easy-back.herokuapp.com");

export const SocketProvider = (props) => {
  const [ownUserInfo] = useContext(UserDetailsContext);
  const [value, setValue] = useState({
    messages: [],
    otherUserInfo: {},
    isOtherUserSharingScreen: false,
    otherUserPeerID: undefined,
    code: "",
  });

  useEffect(() => {
    if (ownUserInfo.userName) {
      initEventListeners({ setValue }, ownUserInfo);
    }
  }, [ownUserInfo]);

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};
