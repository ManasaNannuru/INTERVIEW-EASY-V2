import { useEffect, memo, useRef } from "react";
import { Chip, IconButton } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import Button from "@mui/material/Button";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOnIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import "./VideoArea.css";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useState } from "react";

export const VideoArea = memo(
  ({
    incomingVideoStream,
    ownVideoStream,
    ownUserName,
    otherUserName,
    onCallEnd,
  }) => {
    const ownVideoRef = useRef();
    const incomingVideoRef = useRef();
    const navigate = useNavigate();
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState();
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);

    const toggleAudio = useCallback(() => {
      ownVideoStream.getAudioTracks().forEach((audioTrack) => {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      });
    }, [ownVideoStream]);

    const toggleVideo = useCallback(() => {
      ownVideoStream.getVideoTracks().forEach((videoTrack) => {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      });
    }, [ownVideoStream]);

    const onCallEndClick = useCallback(() => {
      setOpenConfirmationDialog(true);
    }, []);

    const handleCancelDialog = useCallback(() => {
      setOpenConfirmationDialog(false);
    }, []);

    const handleOkDialog = useCallback(() => {
      setOpenConfirmationDialog(false);
      onCallEnd();
      navigate("/");
    }, [navigate, onCallEnd]);

    useEffect(() => {
      if (incomingVideoStream)
        incomingVideoRef.current.srcObject = incomingVideoStream;
    }, [incomingVideoStream]);

    useEffect(() => {
      if (ownVideoStream) {
        ownVideoRef.current.srcObject = ownVideoStream;
        ownVideoStream.getAudioTracks().forEach((audioTrack) => {
          setAudioEnabled(audioTrack.enabled);
        });
        ownVideoStream.getVideoTracks().forEach((videoTrack) => {
          setVideoEnabled(videoTrack.enabled);
        });
      }
    }, [ownVideoStream]);

    return (
      <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
        <div className="videos">
          <div className={incomingVideoStream !== null ? "video-2" : "video-1"}>
            <video
              style={{ width: "100%", height: "100%" }}
              ref={ownVideoRef}
              playsInline
              autoPlay
            ></video>
            <Chip className="user-info" label={ownUserName} />
          </div>
          {incomingVideoStream !== null && (
            <div className="video-2">
              <video
                style={{ width: "100%", height: "100%" }}
                ref={incomingVideoRef}
                playsInline
                autoPlay
              ></video>
              <Chip className="user-info" label={otherUserName} />
            </div>
          )}
        </div>
        <div className="media-controls">
          {/* <IconButton sx={{ color: "white" }}>
            <CallIcon fontSize="large" />
          </IconButton> */}

          <IconButton sx={{ color: "white" }} onClick={toggleAudio}>
            {audioEnabled ? (
              <MicOnIcon fontSize="large" />
            ) : (
              <MicOffIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton sx={{ color: "white" }} onClick={toggleVideo}>
            {videoEnabled ? (
              <VideocamIcon fontSize="large" />
            ) : (
              <VideocamOffIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton sx={{ color: "white" }} onClick={onCallEndClick}>
            <CallEndIcon fontSize="large" />
          </IconButton>
        </div>
        <Dialog open={openConfirmationDialog} onClose={handleCancelDialog}>
          <DialogTitle>End meeting</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to end the meeting?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDialog}>Cancel</Button>
            <Button onClick={handleOkDialog} autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
);
