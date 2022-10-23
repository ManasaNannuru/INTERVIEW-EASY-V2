import { useEffect, memo, useRef } from "react";
import { Chip } from "@mui/material";
import "./VideoArea.css";

export const VideoArea = memo(
  ({ incomingVideoStream, ownVideoStream, ownUserName, otherUserName }) => {
    const ownVideoRef = useRef();
    const incomingVideoRef = useRef();

    useEffect(() => {
      if (incomingVideoStream)
        incomingVideoRef.current.srcObject = incomingVideoStream;
    }, [incomingVideoStream]);

    useEffect(() => {
      if (ownVideoStream) ownVideoRef.current.srcObject = ownVideoStream;
    }, [ownVideoStream]);

    return (
      <div className="videos">
        <div className="video">
          <video ref={ownVideoRef} playsInline autoPlay></video>
          <Chip className="user-info" label={ownUserName} />
        </div>
        {incomingVideoStream !== null && (
          <div className="video">
            <video ref={incomingVideoRef} playsInline autoPlay></video>
            <Chip className="user-info" label={otherUserName} />
          </div>
        )}
      </div>
    );
  }
);
