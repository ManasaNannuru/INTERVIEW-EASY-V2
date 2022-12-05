const app = require("express")();
const server = require("http").createServer(app);
require("dotenv").config();
const cors = require("cors");
const formidable = require("formidable");
const fs = require("fs");
const multer = require("multer");
const AWS = require("aws-sdk");
const config = require("./config");
const { ExpressPeerServer } = require("peer");
const path = require("path");
const nodemailer = require("nodemailer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
  expire_timeout: 600000,
  alive_timeout: 600000,
});

app.use(cors());

app.use("/peerjs", peerServer);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(require("express").json());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("server is running");
});

app.post("/", (req, res) => {
  res.send("server is running");
});

//file upload and get part
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  const userID = req.header("user-id");
  /* if (req.file == null) {
    return res.status(400).json({ message: "Please choose the file" });
  } */

  uploadFile(req.file.path, req.file.filename, userID, res);
});

app.get("/resume/:userID", (req, res) => {
  const userID = req.params["userID"];
  console.log(userID);
  const filename = `uploads/${userID}/Resume.pdf`;
  retrieveFile(filename, res);
});

let feedBackByRoomID = {};

app.post("/updateFeedback", (req, res) => {
  const userID = req.header("user-id");
  if (!feedBackByRoomID[req.body.roomID]) {
    feedBackByRoomID[req.body.roomID] = [];
  }
  feedBackByRoomID[req.body.roomID].push(req.body.feedback)
  return res.send({ success: true });
});

function uploadFile(source, targetName, userID, res) {
  console.log("preparing to upload...");
  fs.readFile(source, (err, filedata) => {
    if (!err) {
      const putParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `uploads/${userID}/Resume.pdf`,
        Body: filedata,
      };
      s3.putObject(putParams, (err, data) => {
        if (err) {
          console.log("Could nor upload the file. Error :", err);
          return res.send({ success: false });
        } else {
          fs.unlink(source, (err) => {
            if (err) console.log("Erorr:", err);
          }); // Deleting the file from uploads folder(Optional).Do Whatever you prefer.
          console.log("Successfully uploaded the file");
          return res.send({ success: true });
        }
      });
    } else {
      console.log({ err: err });
    }
  });
}

function retrieveFile(filename, res) {
  const getParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename,
  };

  s3.getObject(getParams, function (err, data) {
    if (err) {
      return res.status(400).send({ success: false, err: err });
    } else {
      return res.send(data.Body);
    }
  });
}

const exportAll = (userListByRoomID, messages, feedbacks) => {
  console.log("here");
  let interviewer = {};
  let interviewee = {};
  for (const key in userListByRoomID) {
    const user = userListByRoomID[key];
    if (user.isInterviewer) interviewer = user;
    else interviewee = user;
  }

  const sender = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: "587",
    // secure: true,
    secureConnection: false,
    auth: {
      user: "intervieweazy@outlook.com",
      pass: "JustF0rFun",
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
  const s3Url = `https://interview-easy.s3.amazonaws.com/uploads/${interviewee.uid}/Resume.pdf`;
  console.log(s3Url);
  //path.join(__dirname, config.default.vault, interviewee.uid, "Resume")
  const resumeAttachment = {
    filename: "Resume.pdf",
    path: s3Url,
  };

  let messageContent = "";

  messages?.forEach((messageObj) => {
    messageContent += `${messageObj.userName}: ${messageObj.message}
    `;
  });

  let feedBackContent = "";

  feedbacks?.forEach((feedBack) => {
    feedBackContent += `${feedBack}
    `;
  });

  const chatAttachment = {
    filename: "chat.txt",
    content: messageContent,
  };

  const feedBackAttachment = {
    filename: "candidateFeedback.txt",
    content: feedBackContent,
  };
  var mail = {
    from: "intervieweazy@outlook.com",
    to: interviewer.email,
    subject: `Interview with ${interviewee.userName}`,
    attachments: [resumeAttachment, chatAttachment, feedBackAttachment],
    text: "Attached the details of the interview",
  };

  sender.sendMail(mail, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent successfully: " + info.response);
    }
  });
};

const userListByRoomID = {};
const messagesByRoomID = {};

io.on("connection", (socket) => {
  socket.emit("registered", socket.id);

  socket.on("room-is-ready", (roomId, peerID, userInfo) => {
    if (!userListByRoomID[roomId]) {
      userListByRoomID[roomId] = {};
    }

    userListByRoomID[roomId][`${userInfo.userName}${userInfo.email}`] =
      userInfo;

    socket.join(roomId);
    socket.to(roomId).emit("user-joined", peerID, userInfo);
    io.in(roomId).emit("list-of-users", userListByRoomID[roomId]);
    io.in(roomId).emit("list-of-messages", messagesByRoomID[roomId]);

    socket.on("disconnect-user", () => {
      socket.to(roomId).emit("user-disconnected", userInfo);
      socket.to(roomId).emit("on-screen-sharing", false);
      exportAll(userListByRoomID[roomId], messagesByRoomID[roomId], feedBackByRoomID[roomId]);
      delete userListByRoomID[roomId][`${userInfo.userName}${userInfo.email}`];
      io.in(roomId).emit("list-of-users", userListByRoomID[roomId]);
    });

    socket.on("new-message", (newMessage, userName) => {
      if (!messagesByRoomID[roomId]) {
        messagesByRoomID[roomId] = [];
      }
      const newMessageObj = { message: newMessage, userName: userName };
      messagesByRoomID[roomId].push(newMessageObj);
      io.in(roomId).emit("list-of-messages", messagesByRoomID[roomId]);
    });

    socket.on("on-update-code", (newCode) => {
      socket.to(roomId).emit("on-code-updated", newCode);
    });

    socket.on("on-screen-sharing", (roomID, status) => {
      socket.to(roomID).emit("on-screen-sharing", status);
    });
  });
});

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
