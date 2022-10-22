import { useEffect, memo, useRef } from "react";
import "./VideoArea.css";

export const VideoArea = memo(({ incomingVideoStream, ownVideoStream }) => {
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
      <video ref={ownVideoRef} className="video" playsInline autoPlay></video>
      {incomingVideoStream !== null && (
        <video
          ref={incomingVideoRef}
          className="video"
          playsInline
          autoPlay
        ></video>
      )}
    </div>
  );
});
