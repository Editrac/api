import winston from 'winston';
import { config } from './config';
import { Environment } from './@types/enum';

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: config.env === Environment.Production ? "info" : "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple()
      )
    }),
  ]
}

const logger = winston.createLogger(options);

export default logger;
