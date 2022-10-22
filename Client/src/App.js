import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { CreateMeeting } from "./features/create-meeting/CreateMeeting";
import { JoinMeeting } from "./features/join-meeting/JoinMeeting";
import { MeetingRoom } from "./features/meeting-room/MeetingRoom";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<CreateMeeting />} />
          <Route exact path="/join" element={<JoinMeeting />} />
          <Route exact path="/room/:roomID" element={<MeetingRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
