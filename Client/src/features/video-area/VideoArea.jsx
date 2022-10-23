import { useEffect, memo, useRef } from "react";
import { Chip, IconButton } from "@mui/material";
// import CallIcon from "@mui/icons-material/Call";
import Button from "@mui/material/Button";
import CallEndIcon from "@mui/icons-material/CallEnd";

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
  ({ incomingVideoStream, ownVideoStream, ownUserName, otherUserName }) => {
    const ownVideoRef = useRef();
    const incomingVideoRef = useRef();
    const navigate = useNavigate();
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState();

    const onCallEnd = useCallback(() => {
      setOpenConfirmationDialog(true);
    }, []);

    const handleCancelDialog = useCallback(() => {
      setOpenConfirmationDialog(false);
    }, []);

    const handleOkDialog = useCallback(() => {
      setOpenConfirmationDialog(false);
      navigate("/");
    }, [navigate]);

    useEffect(() => {
      if (incomingVideoStream)
        incomingVideoRef.current.srcObject = incomingVideoStream;
    }, [incomingVideoStream]);

    useEffect(() => {
      if (ownVideoStream) ownVideoRef.current.srcObject = ownVideoStream;
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
          <IconButton sx={{ color: "white" }} onClick={onCallEnd}>
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
