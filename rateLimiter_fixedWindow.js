const { Redis } = require("ioredis");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const client = new Redis(process.env.REDIS_SERVICE_URI);

const windowDurationInSeconds = 60;
const maxRequests = 5;

async function fixedWindowAlgo_rateLimiter(req, res, next) {
  const currTime = Math.floor(Date.now() / 1000);
  const userId = req.ip.replace(/:/g, "_");
  console.log(userId);

  const key = `rateLimitCntFixed:${userId}`;

  const result = await client.hgetall(key);

  if (Object.keys(result).length === 0) {
    await client.hset(key, {
      accessAt: currTime,
      count: 1,
    });

    return next();
  }
  if (result) {
    const diff = currTime - result["accessAt"];

    if (diff > windowDurationInSeconds) {
      await client.hset(key, {
        accessAt: currTime,
        count: 1,
      });

      return next();
    } else {
      if (result["count"] >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: "rate-limited-by-FixedWindowAlgo",
        });
      } else {
        await client.hset(key, {
          count: parseInt(result["count"]) + 1,
        });
        return next();
      }
    }
  }
}

module.exports = fixedWindowAlgo_rateLimiter;
