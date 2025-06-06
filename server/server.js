const express = require("express");
const app = express();
const cors = require("cors");

app.use(
  cors({
    //origin: "http://localhost:5173",
    origin: "https://e-moderator-front.vercel.app",
  })
);

app.get("/api", (req, res) => {
  res.send({
    fruits: ["apple", "banana", "orange"],
  });
});

app.listen(8080, () => {
  console.log(`Example app listening on port 8080`);
});

module.exports = app;
