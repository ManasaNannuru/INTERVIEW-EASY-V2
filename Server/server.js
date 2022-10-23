const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("server is running");
});

const userListByRoomID = {};

io.on("connection", (socket) => {
  socket.emit("registered", socket.id);

  socket.on("room-is-ready", (roomId, peerID, userInfo) => {
    if (!userListByRoomID[roomId]) {
      userListByRoomID[roomId] = [];
    }

    userListByRoomID[roomId].push(userInfo);

    socket.join(roomId);
    socket.to(roomId).emit("user-joined", peerID, userInfo);
    socket.to(roomId).emit("list-of-users-updated", userListByRoomID[roomId]);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userInfo);
    });

    socket.on("new-message", (newMessage) => {
      socket.to(roomId).emit("new-message", newMessage);
    });
  });
});

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
