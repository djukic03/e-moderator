const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: ["https://e-moderator-front.vercel.app/"],
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  res.json({ fruits: ["apple", "banana", "cherry"] });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
