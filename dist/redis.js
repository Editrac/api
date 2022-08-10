"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("./config");
const winston_1 = __importDefault(require("./winston"));
const redis = new ioredis_1.default(config_1.config.redis);
redis.on('connect', () => {
    winston_1.default.info('Redis db connected');
});
redis.on('error', (error) => {
    winston_1.default.error(error);
});
exports.default = redis;
