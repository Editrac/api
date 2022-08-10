"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = require("./config");
const enum_1 = require("./@types/enum");
const options = {
    transports: [
        new winston_1.default.transports.Console({
            level: config_1.config.env === enum_1.Environment.Production ? "info" : "debug",
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.simple())
        }),
    ]
};
const logger = winston_1.default.createLogger(options);
exports.default = logger;
