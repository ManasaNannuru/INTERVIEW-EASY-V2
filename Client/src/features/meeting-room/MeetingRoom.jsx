import { Divider } from "@mui/material";
import { memo } from "react";
import { VideoArea } from "../video-area/VideoArea";
import { useParams } from "react-router-dom";
import "./MeetingRoom.css";
import { useEffect } from "react";
import { useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs-client";
import { ChatArea } from "../chat-area/ChatArea";
import { useCallback } from "react";

const socket = io("http://localhost:3001");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "5001",
});

export const MeetingRoom = memo(() => {
  const { roomID } = useParams();
  const [ownVideoStream, setOwnVideoStream] = useState(null);
  const [incomingVideoStream, setIncomingVideoStream] = useState(null);
  const [allMessages, setAllMessages] = useState([]);

  const sendNewMessage = useCallback((message) => {
    socket.emit("new-message", message);
  }, []);

  useEffect(() => {
    socket.on("new-message", (newMessage) => {
      setAllMessages([...allMessages, newMessage]);
    });
    return () => {
      socket.removeListener("new-message");
    };
  }, [allMessages]);

  useEffect(() => {
    if (ownVideoStream) {
      socket.on("user-joined", (userId) => {
        const call = myPeer.call(userId, ownVideoStream);
        call.on("stream", (otherVideoStream) => {
          setIncomingVideoStream(otherVideoStream);
        });
        call.on("close", () => {
          setIncomingVideoStream(null);
        });
      });
    }

    myPeer.on("open", (id) => {
      socket.emit("room-is-ready", roomID, id);
    });

    socket.on("user-disconnected", () => {
      setIncomingVideoStream(null);
    });
  }, [ownVideoStream, roomID]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setOwnVideoStream(stream);
        myPeer.on("call", (call) => {
          call.answer(stream);

          call.on("stream", (otherVideoStream) => {
            setIncomingVideoStream(otherVideoStream);
          });
        });
      })
      .catch((error) => {
        alert("Please allow access to video and audio to continue");
      });
  }, [roomID]);

  return (
    <div className="meeting-room">
      <div className="video-area">
        <VideoArea
          incomingVideoStream={incomingVideoStream}
          ownVideoStream={ownVideoStream}
        />
      </div>
      <Divider orientation="vertical" flexItem classes={{ root: "divider" }} />
      <div className="chat-and-participant-area">
        <div style={{ height: "50%" }}>Participants Area</div>
        <ChatArea allMessages={allMessages} sendMessage={sendNewMessage} />
      </div>
    </div>
  );
});
