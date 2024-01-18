const { Redis } = require("ioredis");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const client = new Redis(process.env.REDIS_SERVICE_URI);

const windowDurationInSeconds = 60;
const maxRequests = 5;

async function slidingWindowAlgo_rateLimiter(req, res, next) {
  const currTime = Math.floor(Date.now() / 1000);
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  const userId = (
    forwardedFor ||
    realIp ||
    req.connection.remoteAddress
  ).replace(/:/g, "_");
  console.log(userId);

  const key = `rateLimitCntSliding:${userId}`;

  const trimTime = currTime - windowDurationInSeconds;
  await client.zremrangebyscore(key, 0, trimTime);

  const requestCnt = await client.zcard(key);
  if (requestCnt < maxRequests) {
    await client.zadd(key, currTime, currTime);
    next();
  } else {
    return res.status(429).json({
      success: false,
      message: "rate-limited-slidingWindowAlgo",
    });
  }
}

module.exports = slidingWindowAlgo_rateLimiter;
