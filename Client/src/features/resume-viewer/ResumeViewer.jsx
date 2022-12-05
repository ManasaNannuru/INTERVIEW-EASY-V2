import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useState, useContext } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { SocketContext } from "../../socket-context";
import { useCallback } from "react";
import "./ResumeViewer.css";
import { updateFeedback } from "../../requestHelper";
import { UserDetailsContext } from "../../user-context";

export const ResumeViewer = ({
  isOpen,
  onClose,
  feedbacks,
  onAddFeedback,
  roomID,
}) => {
  const { otherUserInfo } = useContext(SocketContext);
  const [ownUserInfo] = useContext(UserDetailsContext);
  const [feedback, setFeedback] = useState("");
  const defaultLayoutPluginInstance = zoomPlugin();

  const handleFeedbackChange = useCallback((e) => {
    setFeedback(e.target.value);
  }, []);

  const onEnter = useCallback(() => {
    updateFeedback(ownUserInfo.uid, roomID, feedback).then(() => {
      onAddFeedback(feedback);
      setFeedback("");
    });
  }, [feedback, onAddFeedback, ownUserInfo.uid, roomID]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      classes={{ paper: "resume-viewer" }}
    >
      <DialogTitle>
        Resume
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent className="resume-viewer-content">
        <div className="resume" onContextMenu={(e) => e.preventDefault()}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
            <Viewer
              plugins={[defaultLayoutPluginInstance]}
              fileUrl={`https://interview-easy-v1-back-end.herokuapp.com/resume/${otherUserInfo.uid}`}
              // fileUrl={`https://interview-easy-back.herokuapp.com/resume/${otherUserInfo.uid}`}
              // fileUrl={`http://localhost:3001/resume/${otherUserInfo.uid}`}
              initialPage={0}
              defaultScale={SpecialZoomLevel.PageWidth}
            />
          </Worker>
        </div>
        <Paper className="feedback-area">
          <div className="feedback-header"> Feedback</div>
          {/* <Divider
            orientation="horizontal"
            flexItem
            classes={{ root: "horizontal-divider" }}
          /> */}
          <div className="messages_feedback">
            {feedbacks?.map((feedback) => {
              return <div>{feedback}</div>;
            })}
          </div>

          <OutlinedInput
            className="feedback-input"
            value={feedback}
            onChange={handleFeedbackChange}
            onSubmit={onEnter}
            endAdornment={
              <InputAdornment>
                <IconButton onClick={onEnter} edge="end">
                  <SendRoundedIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
