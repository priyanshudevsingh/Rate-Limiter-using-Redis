const express = require("express");
const rateLimiter = require("./rateLimiter_fixedWindow");

const app = express();
app.use(rateLimiter);

app.get("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong",
  });
});

app.listen(5000, () => {
  console.log("server is running");
});
