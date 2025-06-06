const express = require("express");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: ["https://e-moderator-front.vercel.app"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ fruits: ["apple", "banana", "cherry"] });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

module.exports = app;
