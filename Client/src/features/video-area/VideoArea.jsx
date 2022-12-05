import AssignmentIcon from "@mui/icons-material/Assignment";
import CallEndIcon from "@mui/icons-material/CallEnd";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import MicOnIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PresentToAllIcon from "@mui/icons-material/PresentToAll";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Chip, IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Peer } from "peerjs";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuid4 } from "uuid";
import { config } from "../../config";
import { replaceStream } from "../../helpers";
import { SocketContext } from "../../socket-context";
import {
  onRoomIsReady,
  onScreenSharing,
} from "../../socket-context/EventEmitters";
import { UserDetailsContext } from "../../user-context";
import { CodingArea } from "../coding-area/CodingArea";
import { ResumeViewer } from "../resume-viewer/ResumeViewer";
import "./VideoArea.css";

const myPeer = new Peer(uuid4(), {
  host: config.serverHostName,
  secure: true,
  port: config.serverPort,
  path: "peerjs",
  config: {
    iceServers: config.iceServers,
  },
});

let otherPeer = null;

let streamAlreadyRequested = false;

export const VideoArea = memo(
  ({ roomID, exitRoom, toogleCodingAreaVisibility, isCodingAreaOpen }) => {
    const [ownUserInfo] = useContext(UserDetailsContext);
    const { otherUserInfo, otherUserPeerID, isOtherUserSharingScreen } =
      useContext(SocketContext);
    const ownVideoRef = useRef();
    const incomingVideoRef = useRef();
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [screenSharingInProgress, setScreenSharingInProgress] =
      useState(false);
    const [ownVideoStream, setOwnVideoStream] = useState();
    const [incomingVideoStream, setIncomingVideoStream] = useState();
    const [isResumeViewerOpen, setIsResumeViewerOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);

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

    const onOpenResumeViewer = useCallback(() => {
      setIsResumeViewerOpen(true);
    }, []);

    const onCloseResumeViewer = useCallback(() => {
      setIsResumeViewerOpen(false);
    }, []);

    const handleCancelDialog = useCallback(() => {
      setOpenConfirmationDialog(false);
    }, []);

    const handleOkDialog = useCallback(() => {
      setOpenConfirmationDialog(false);
      ownVideoStream.getTracks().forEach((track) => track.stop());
      setOwnVideoStream(null);
      myPeer.disconnect();
      ownVideoRef.current.srcObject = null;
      exitRoom();
    }, [exitRoom, ownVideoStream]);

    const stopScreenSharing = useCallback(() => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((stream) => {
          replaceStream(otherPeer, stream);
          onScreenSharing(roomID, false);
        });
    }, [roomID]);

    const startScreenSharing = useCallback(() => {
      navigator.mediaDevices.getDisplayMedia().then((stream) => {
        replaceStream(otherPeer, stream);
        onScreenSharing(roomID, true);
        stream.getVideoTracks()[0].addEventListener("ended", () => {
          stopScreenSharing();
        });
      });
    }, [roomID, stopScreenSharing]);

    const toggleScreenSharing = useCallback(() => {
      if (screenSharingInProgress) {
        stopScreenSharing();
      } else {
        startScreenSharing();
      }
    }, [screenSharingInProgress, startScreenSharing, stopScreenSharing]);

    const onAddFeedback = useCallback(
      (feedback) => {
        setFeedbacks([...feedbacks, feedback]);
      },
      [feedbacks]
    );

    useEffect(() => {
      if (roomID && ownUserInfo.userName && !streamAlreadyRequested) {
        streamAlreadyRequested = true;
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
          })
          .then((ownStream) => {
            setAudioEnabled(
              !ownStream
                .getAudioTracks()
                .some((audioTrack) => !audioTrack.enabled)
            );
            setVideoEnabled(
              !ownStream
                .getVideoTracks()
                .some((videoTrack) => !videoTrack.enabled)
            );
            setOwnVideoStream(ownStream);
            ownVideoRef.current.srcObject = ownStream;
            myPeer.on("call", (call) => {
              call.answer(ownStream);
              call.on("stream", (otherVideoStream) => {
                setIncomingVideoStream(otherVideoStream);
              });
              otherPeer = call;
            });

            onRoomIsReady(roomID, myPeer.id, ownUserInfo);
          })
          .catch((error) => {
            alert("Please allow access to video and audio to continue");
          });
      }
    }, [ownUserInfo, roomID]);

    useEffect(() => {
      if (otherUserInfo.userName && otherUserPeerID && ownVideoStream) {
        const call = myPeer.call(
          otherUserPeerID,
          ownVideoStream,
          otherUserInfo
        );

        call.on("stream", (otherVideoStream) => {
          setIncomingVideoStream(otherVideoStream);
        });

        call.on("close", () => {
          setIncomingVideoStream(null);
          if (incomingVideoRef.current)
            incomingVideoRef.current.srcObject = null;
        });

        otherPeer = call;
      } else {
        setIncomingVideoStream(null);
        if (incomingVideoRef.current) incomingVideoRef.current.srcObject = null;
      }
    }, [otherUserInfo, otherUserPeerID, ownVideoStream]);

    useEffect(() => {
      if (incomingVideoStream !== null) {
        incomingVideoRef.current.srcObject = incomingVideoStream;
      }
    }, [incomingVideoStream]);

    useEffect(() => {
      setScreenSharingInProgress(isOtherUserSharingScreen);
    }, [isOtherUserSharingScreen]);

    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "calc(100% - 5rem)",
            flexDirection: "row",
            width: "100%",
          }}
        >
          {isCodingAreaOpen && <CodingArea />}
          <div
            className={`videos${
              screenSharingInProgress || isCodingAreaOpen
                ? " flex-direction-column"
                : ""
            }`}
            style={{ width: isCodingAreaOpen ? "50%" : "100%", height: "100%" }}
          >
            <div
              className={`${
                screenSharingInProgress
                  ? "top-row"
                  : incomingVideoStream !== null
                  ? "video-2"
                  : "video-1"
              }${
                isCodingAreaOpen && incomingVideoStream !== null
                  ? " height-50"
                  : ""
              }`}
            >
              <video
                style={{ width: "100%", height: "100%" }}
                ref={ownVideoRef}
                playsInline
                autoPlay
              ></video>
              <Chip className="user-info" label={ownUserInfo.userName} />
            </div>
            {incomingVideoStream !== null && (
              <div
                className={`${
                  screenSharingInProgress ? "bottom-row" : "video-2"
                }${isCodingAreaOpen ? " height-50" : ""}`}
              >
                <video
                  style={{ width: "100%", height: "100%" }}
                  ref={incomingVideoRef}
                  playsInline
                  autoPlay
                ></video>
                <Chip className="user-info" label={otherUserInfo.userName} />
              </div>
            )}
          </div>
        </div>

        <div className="media-controls">
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
          <IconButton
            sx={{ color: "white" }}
            onClick={toggleScreenSharing}
            className={incomingVideoStream === null ? "disabled-icon" : ""}
          >
            {!screenSharingInProgress ? (
              <PresentToAllIcon fontSize="large" />
            ) : (
              <CancelPresentationIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton sx={{ color: "white" }} onClick={onCallEndClick}>
            <CallEndIcon fontSize="large" />
          </IconButton>
          {ownUserInfo.isInterviewer && (
            <IconButton
              sx={{ color: "white" }}
              onClick={onOpenResumeViewer}
              className={otherUserInfo.uid === undefined ? "disabled-icon" : ""}
            >
              <AssignmentIcon fontSize="large" />
            </IconButton>
          )}
          <IconButton
            sx={{ color: "white" }}
            onClick={toogleCodingAreaVisibility}
            className={otherUserInfo.uid === undefined ? "disabled-icon" : ""}
          >
            <DeveloperModeIcon fontSize="large" />
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
        {isResumeViewerOpen && (
          <ResumeViewer
            isOpen={isResumeViewerOpen}
            feedbacks={feedbacks}
            onAddFeedback={onAddFeedback}
            onClose={onCloseResumeViewer}
          />
        )}
      </div>
    );
  }
);
