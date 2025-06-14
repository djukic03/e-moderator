const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { type } = require("os");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    //origin: "https://e-moderator-front.vercel.app",
    methods: ["GET", "POST"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    //origin: "https://e-moderator-front.vercel.app",
    methods: ["GET", "POST"],
  },
});

const plenumi = {};
const speakers = {};

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

    const user = plenum.users.find((u) => u.clientId === clientId);
    if (user) {
      user.socketId = socket.id;
      console.log(`🔄 Клијент ${clientId} поново повезан у ${meetingId}`);
    } else {
      plenum.users.push({
        clientId,
        socketId: socket.id,
        name: name || "Unknown",
      });
    }

    socket.join(meetingId);

    console.log(
      `Корисник ${name} | ${clientId} се прикључио састанку ${meetingId}`
    );

    io.to(meetingId).emit("joined_meeting", plenum);
  });

  socket.on("request_to_speak", ({ meetingId, clientId, typeOfSpeech }) => {
    const plenum = plenumi[meetingId];
    if (!plenum) {
      socket.emit("error", "meeting_not_found");
      return;
    }

    const user = plenum.users.find((u) => u.clientId === clientId);
    if (user) {
      if (!speakers[meetingId]) {
        speakers[meetingId] = { users: [] };
      }
      speakers[meetingId].users.push({
        clientId,
        socketId: user.socketId,
        name: user.name,
        typeOfSpeech: typeOfSpeech,
      });
    }
    const meetingSpeakers = speakers[meetingId];

    console.log(
      `Korisnik ${user.name} | ${clientId} se javio za ${typeOfSpeech}`
    );

    io.to(meetingId).emit("speech_requested", meetingSpeakers);
  });

  socket.on("cancel_request", ({ meetingId, clientId }) => {
    const plenum = plenumi[meetingId];
    if (!plenum) {
      socket.emit("error", "meeting_not_found");
      return;
    }

    const user = plenum.users.find((u) => u.clientId === clientId);
    if (user) {
      const index = speakers[meetingId].users.findIndex(
        (u) => u.clientId === clientId
      );
      if (index !== -1) {
        speakers[meetingId].users.splice(index, 1);
      }
    }
    const meetingSpeakers = speakers[meetingId];

    console.log(`Korisnik ${user.name} | ${clientId} je odustao od price`);

    io.to(meetingId).emit("request_cancelled", meetingSpeakers);
  });

  socket.on("get_plenum", (meetingId, callback) => {
    const plenum = plenumi[meetingId];
    const meetingSpeakers = speakers[meetingId];
    if (!plenum) {
      callback({ error: "Plenum ne postoj." });
      return;
    }
    callback({ plenum, meetingSpeakers });
  });

  socket.on("start_timer", (clientId) => {
    console.log(`Timer je pokrenut za ${clientId}`);
    io.emit("timer_started", clientId);
  });

  socket.on("end_timer", (clientId) => {
    console.log(`Timer je zavrsen za ${clientId}`);
    io.emit("timer_ended", clientId);
  });

  socket.on("disconnect", () => {
    console.log("Клијент се искључио:", socket.id);

    setTimeout(() => {
      for (const meetingId in plenumi) {
        const plenum = plenumi[meetingId];
        const index = plenum.users.findIndex((u) => u.socketId === socket.id);
        if (index !== -1) {
          const user = plenum.users[index];
          if (user.socketId !== socket.id) return;

          plenum.users.splice(index, 1);

          const meetingSpeakers = speakers[meetingId];
          if (meetingSpeakers) {
            const index = meetingSpeakers.users.findIndex(
              (u) => u.socketId === socket.id
            );
            if (index !== -1) {
              meetingSpeakers.users.splice(index, 1);
            }
          }
          io.to(meetingId).emit("left_meeting", plenum, meetingSpeakers);
          console.log(`👋 ${user.name} напустио Plenum ${meetingId}`);
        }
      }
    }, 2000);
  });
});

server.listen(8080, () => {
  console.log(`Example app listening on port 8080`);
});

module.exports = app;
