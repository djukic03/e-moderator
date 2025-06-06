const express = require("express");
const cors = require("cors");
const { createServer } = require("@vercel/node");

const app = express();
const corsOptions = {
  origin: ["https://e-moderator-front.vercel.app"],
  credentials: true,
};

app.use(cors());

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ fruits: ["apple", "banana", "cherry"] });
});

module.exports = app;
