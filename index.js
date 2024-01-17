const express = require("express");
// const fixedWindowAlgo_rateLimiter = require("./rateLimiter_fixedWindow");
const slidingWindowAlgo_rateLimiter = require("./rateLimiter_slidingWindow");

const app = express();
// app.use(fixedWindowAlgo_rateLimiter);
app.use(slidingWindowAlgo_rateLimiter);

app.get("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "PING PONG",
  });
});

app.listen(5000, () => {
  console.log("server is running");
});
