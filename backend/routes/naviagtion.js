const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/activity", (req, res) => {
  res.json([
    { id: 1, text: "New comic uploaded" },
    { id: 2, text: "User commented on Story 12" },
  ]);
});

app.get("/api/origin", (req, res) => {
  res.json({
    creator: "Comic Team",
    started: "2024",
    purpose: "Creative learning",
  });
});

app.get("/api/visibility", (req, res) => {
  res.json({ views: 3400, likes: 900 });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
