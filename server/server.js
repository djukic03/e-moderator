const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { type } = require("os");

const app = express();
app.use(
  cors({
    //origin: "http://localhost:5173",
    origin: "https://e-moderator-front.vercel.app",
    methods: ["GET", "POST"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    //origin: "http://localhost:5173",
    origin: "https://e-moderator-front.vercel.app",
    methods: ["GET", "POST"],
  },
});

const plenumi = {};

io.on("connection", (socket) => {
  const clientId = socket.handshake.auth.clientId;
  console.log("Нови клијент:", clientId, " socket id:", socket.id);

  socket.on("create_meeting", ({ moderator }) => {
    const meetingId = uuidv4();
    plenumi[meetingId] = { id: meetingId, moderatorId: moderator, users: [] };
    socket.emit("meeting_created", meetingId);
    console.log(`Plenum ${meetingId}, moderator: ${moderator}`);
  });

  socket.on("join_meeting", ({ meetingId, clientId, name }) => {
    const plenum = plenumi[meetingId];
    if (!plenum) {
      socket.emit("error", "meeting_not_found");
      return;
    }

    socket.join(meetingId);

    const alreadyJoined = plenum.users.some(
      (user) => user.clientId === clientId
    );
    if (!alreadyJoined) {
      plenum.users.push({ clientId, name: name || "Unknown" });
    }

    console.log(
      `Корисник ${name} | ${clientId} се прикључио састанку ${meetingId}`
    );

    //socket.emit("joined_meeting", plenum);
    io.to(meetingId).emit("joined_meeting", plenum);
  });

  socket.on("get_plenum", (meetingId, callback) => {
    const plenum = plenumi[meetingId];
    if (!plenum) {
      callback({ error: "Plenum ne postoji." });
      return;
    }
    callback({ plenum });
  });

  socket.on("disconnect", () => {
    console.log("Клијент се искључио:", socket.id);
  });
});

/*app.get("/api", (req, res) => {
  res.send({ usersInPlenum });
});*/

server.listen(8080, () => {
  console.log(`Example app listening on port 8080`);
});

module.exports = app;
