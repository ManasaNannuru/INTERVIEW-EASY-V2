import { Divider } from "@mui/material";
import { memo } from "react";
import { VideoArea } from "../video-area/VideoArea";
import { useNavigate, useParams } from "react-router-dom";
import "./MeetingRoom.css";
import { useEffect } from "react";
import { useState } from "react";
import { ChatArea } from "../chat-area/ChatArea";
import { useCallback } from "react";
import { ParticipantsList } from "../participants-list/ParticipantsList";

let streamRequestedAlready = false;

export const MeetingRoom = memo(
  ({
    userInfo,
    setRoomID,
    socket,
    myPeer,
    setOtherUserInfo,
    otherUserInfo,
  }) => {
    const { roomID } = useParams();
    const { userName } = userInfo;
    const [ownVideoStream, setOwnVideoStream] = useState(null);
    const [incomingVideoStream, setIncomingVideoStream] = useState(null);
    const [allMessages, setAllMessages] = useState([]);
    const [userList, setUserList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      if (!userName || !roomID) {
        setRoomID(roomID);
        navigate("/");
      }
    }, [navigate, roomID, setRoomID, userName]);

    const sendNewMessage = useCallback(
      (message) => {
        socket.emit("new-message", message, userName);
        setAllMessages([...allMessages, { message, userName }]);
      },
      [socket, allMessages, userName]
    );

    const endCall = useCallback(() => {
      ownVideoStream.getTracks().forEach((track) => track.stop());
      setOwnVideoStream(null);
      myPeer.disconnect();
      socket.emit("disconnect-user");
    }, [myPeer, ownVideoStream, socket]);

    useEffect(() => {
      socket.on("new-message", (newMessage) => {
        setAllMessages([...allMessages, newMessage]);
      });
      return () => {
        socket.removeListener("new-message");
      };
    }, [allMessages, socket]);

    useEffect(() => {
      socket.on("list-of-users-updated", (updatedUsersList, joinedUserInfo) => {
        const updatedUsers = [];
        for (let user in updatedUsersList) {
          updatedUsers.push(user);
          if (user !== userName) {
            setOtherUserInfo({ userName: user, email: updatedUsersList[user] });
          }
        }
        setUserList(updatedUsers);
      });
    }, [setOtherUserInfo, socket, userName]);

    useEffect(() => {
      if (userName && roomID && ownVideoStream) {
        socket.on("user-joined", (joinedUserPeerID, joinedUserInfo) => {
          const call = myPeer.call(
            joinedUserPeerID,
            ownVideoStream,
            joinedUserInfo
          );
          console.log(
            "Calling user with peer id: ",
            joinedUserPeerID,
            ownVideoStream
          );

          call.on("stream", (otherVideoStream) => {
            console.log("Call Answered");
            setIncomingVideoStream(otherVideoStream);
          });

          call.on("close", () => {
            console.log("Call Ended");
            setIncomingVideoStream(null);
          });
        });
      }

      socket.on("user-disconnected", (disconnectedUserInfo) => {
        setIncomingVideoStream(null);
        console.log("Disconnected User info", disconnectedUserInfo);
      });
    }, [
      myPeer,
      ownVideoStream,
      roomID,
      setOtherUserInfo,
      socket,
      userInfo,
      userName,
    ]);

    useEffect(() => {
      if (!streamRequestedAlready && userName && roomID) {
        streamRequestedAlready = true;
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
          })
          .then((ownStream) => {
            ownStream.getVideoTracks(
              (videoTrack) => (videoTrack.enabled = true)
            );
            setOwnVideoStream(ownStream);
            myPeer.on("call", (call) => {
              console.log("Receiving Call");
              call.answer(ownStream);

              call.on("stream", (otherVideoStream) => {
                setIncomingVideoStream(otherVideoStream);
              });
            });
            console.log("Rom is ready emitted");
            socket.emit("room-is-ready", roomID, myPeer.id, userInfo);
          })
          .catch((error) => {
            alert("Please allow access to video and audio to continue");
          });
      }
    }, [myPeer, roomID, socket, userInfo, userName]);

    return (
      <div className="meeting-room">
        <div className="video-area">
          <VideoArea
            incomingVideoStream={incomingVideoStream}
            ownVideoStream={ownVideoStream}
            ownUserName={userName}
            otherUserName={otherUserInfo.userName}
            onCallEnd={endCall}
          />
        </div>
        <Divider
          orientation="vertical"
          flexItem
          classes={{ root: "divider" }}
        />
        <div className="chat-and-participant-area">
          <ParticipantsList users={userList} />
          <Divider
            orientation="horizontal"
            flexItem
            classes={{ root: "horizontal-divider" }}
          />
          <ChatArea
            allMessages={allMessages}
            sendMessage={sendNewMessage}
            ownUserName={userName}
          />
        </div>
      </div>
    );
  }
);
