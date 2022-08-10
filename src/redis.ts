import Redis from "ioredis";
import { config } from "./config";
import logger from "./winston";

const redis = new Redis(config.redis);

redis.on('connect', () => {
  logger.info('Redis db connected');
});

redis.on('error', (error) => {
  logger.error(error);
});

export default redis;