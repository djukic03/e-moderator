const express = require("express");
const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    //origin: "https://e-moderator-front.vercel.app",
  })
);

var usersInPlenum = ["test1", "test2", "test3", "test4", "test5"];
var usersToSpeak = [];

app.get("/api", (req, res) => {
  res.send({ usersInPlenum });
});

app.listen(8080, () => {
  console.log(`Example app listening on port 8080`);
});

module.exports = app;
