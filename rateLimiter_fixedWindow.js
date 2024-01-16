const { Redis } = require("ioredis");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const client = new Redis(process.env.REDIS_SERVICE_URI);

const rateLimitDurationInSeconds = 60 * 1000;
const maxNumberOfRequest = 5;

async function rateLimiter(req, res, next) {
  const currTime = Date.now();

  const result = await client.hgetall("accessData");

  if (Object.keys(result).length === 0) {
    await client.hset("accessData", {
      accessAt: currTime,
      count: 1,
    });

    return next();
  }
  if (result) {
    const diff = currTime - result["accessAt"];

    if (diff > rateLimitDurationInSeconds) {
      await client.hset("accessData", {
        accessAt: currTime,
        count: 1,
      });

      return next();
    } else {
      if (result["count"] > maxNumberOfRequest) {
        return res.status(429).json({
          success: false,
          message: "rate-limited",
        });
      } else {
        await client.hset("accessData", {
          count: parseInt(result["count"]) + 1,
        });
        return next();
      }
    }
  }
}

module.exports = rateLimiter;
