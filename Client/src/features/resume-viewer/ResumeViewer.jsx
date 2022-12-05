import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
} from "@mui/material";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useState, useContext } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { SocketContext } from "../../socket-context";
import { useCallback } from "react";
import "./ResumeViewer.css";


export const ResumeViewer = ({ isOpen, onClose, feedbacks, onAddFeedback }) => {
  const { otherUserInfo } = useContext(SocketContext);
  const [feedback, setFeedback] = useState("");
  const defaultLayoutPluginInstance = zoomPlugin();

  const handleFeedbackChange = useCallback((e) => {
    setFeedback(e.target.value);
  }, []);

  const onEnter = useCallback(() => {
    onAddFeedback(feedback);
    setFeedback("");
  }, [feedback, onAddFeedback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      classes={{ paper: "resume-viewer" }}
    >
      <DialogTitle>Resume</DialogTitle>
      <DialogContent className="resume-viewer-content">
        <div className="resume" onContextMenu={(e) => e.preventDefault()}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
            <Viewer
              plugins={[defaultLayoutPluginInstance]}
              //fileUrl={`http://localhost:3001/resume/${otherUserInfo.uid}`}
              //fileUrl={`https://interview-easy-v1-back-end.herokuapp.com/resume/${otherUserInfo.uid}`}
              fileUrl={`https://interview-easy-back.herokuapp.com/resume/${otherUserInfo.uid}`}
              initialPage={0}
              defaultScale={SpecialZoomLevel.PageWidth}
            />
          </Worker>
        </div>
        <Paper className="feedback-area">
          <div className="messages">
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
