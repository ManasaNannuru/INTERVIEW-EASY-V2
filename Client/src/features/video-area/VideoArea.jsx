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
        <div className={incomingVideoStream !== null ? "video-2" : "video-1"}>
          <video
            style={{ width: "100%" }}
            ref={ownVideoRef}
            playsInline
            autoPlay
          ></video>
          <Chip className="user-info" label={ownUserName} />
        </div>
        {incomingVideoStream !== null && (
          <div className="video-2">
            <video
              style={{ width: "100%" }}
              ref={incomingVideoRef}
              playsInline
              autoPlay
            ></video>
            <Chip className="user-info" label={otherUserName} />
          </div>
        )}
      </div>
    );
  }
);
