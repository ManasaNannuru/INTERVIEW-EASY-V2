import { Divider } from "@mui/material";
import { memo } from "react";
import { VideoArea } from "../video-area/VideoArea";
import { useParams } from "react-router-dom";
import "./MeetingRoom.css";
import { useEffect } from "react";
import { useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs-client";

const socket = io("http://localhost:3001");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "5001",
});

export const MeetingRoom = memo(() => {
  const { roomID } = useParams();
  const [ownVideoStream, setOwnVideoStream] = useState(null);
  const [incomingVideoStream, setIncomingVideoStream] = useState(null);

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
      <div className="chat-and-participant-area">Chat and Participants</div>
    </div>
  );
});
