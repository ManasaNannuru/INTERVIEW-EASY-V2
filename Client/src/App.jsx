import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { io } from "socket.io-client";
import Peer from "peerjs-client";
import { LoginPage } from "./features/login-page/login-page";
import { MeetingRoom } from "./features/meeting-room/MeetingRoom";
import { v4 as uuid4 } from "uuid";

const socket = io("http://localhost:3001");
const myPeer = new Peer(uuid4(), {
  host: "/",
  port: "5001",
});

console.log("My Peer Id: ", myPeer.id);

function App() {
  const [userInfo, setUserInfo] = useState({});
  const [otherUserInfo, setOtherUserInfo] = useState({});
  const [roomID, setRoomID] = useState();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            element={
              <LoginPage
                setUserInfo={setUserInfo}
                setRoomID={setRoomID}
                roomID={roomID}
              />
            }
          />
          <Route
            exact
            path="/room/:roomID"
            element={
              <MeetingRoom
                userInfo={userInfo}
                roomID={roomID}
                setRoomID={setRoomID}
                socket={socket}
                myPeer={myPeer}
                otherUserInfo={otherUserInfo}
                setOtherUserInfo={setOtherUserInfo}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
