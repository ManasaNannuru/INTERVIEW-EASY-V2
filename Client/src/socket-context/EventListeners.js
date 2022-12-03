import { socket } from ".";

const registeredEventListenersStatus = {
  "list-of-messages": false,
  "user-joined": false,
  "user-disconnected": false,
  "list-of-users": false,
};

export const initEventListeners = ({ setValue }, ownUserInfo) => {
  if (!registeredEventListenersStatus["list-of-messages"]) {
    socket.on("list-of-messages", (listOfMessages) => {
      setValue((state) => {
        return { ...state, messages: listOfMessages };
      });
    });
    registeredEventListenersStatus["list-of-messages"] = true;
  }
  if (!registeredEventListenersStatus["user-joined"]) {
    socket.on("user-joined", (peerID, userInfo) => {
      setValue((state) => {
        return {
          ...state,
          otherUserInfo: userInfo,
          otherUserPeerID: peerID,
        };
      });
    });
    registeredEventListenersStatus["user-joined"] = true;
  }

  if (!registeredEventListenersStatus["user-disconnected"]) {
    socket.on("user-disconnected", () => {
      setValue((state) => {
        return {
          ...state,
          otherUserInfo: {},
          otherUserPeerID: undefined,
        };
      });
    });
    registeredEventListenersStatus["user-disconnected"] = true;
  }

  if (!registeredEventListenersStatus["list-of-users"]) {
    socket.on("list-of-users", (usersList) => {
      setValue((state) => {
        const otherUserInfo = {};
        for (let user in usersList) {
          if (user !== ownUserInfo.userName) {
            otherUserInfo.userName = user;
            otherUserInfo.email = usersList[user];
          }
        }

        return { ...state, otherUserInfo };
      });
    });
    registeredEventListenersStatus["list-of-users"] = true;
  }
};
