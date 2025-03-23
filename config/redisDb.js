import { createClient } from "redis";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URI, // Use Redis Cloud or local Redis
});
redisClient.on("error", (err) => logger.error(`Redis Error: ${err.message}`));
redisClient.on("reconnecting", () =>
    logger.warn("Reconnecting to Redis...")
);

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis Cloud");
  } catch (error) {
    logger.error(`Redis Connection Error: ${error.message}`);
    process.exit(1);
  }
};
export { redisClient, connectRedis };
