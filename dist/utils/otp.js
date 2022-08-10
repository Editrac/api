"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExpired = exports.generateOtp = void 0;
const nanoid_1 = require("nanoid");
const dayjs_1 = __importDefault(require("dayjs"));
function generateOtp() {
    return nanoid_1.customAlphabet('0123456789', 6)();
}
exports.generateOtp = generateOtp;
function isExpired(otpExpiry) {
    if (!otpExpiry)
        return true;
    return dayjs_1.default().isAfter(dayjs_1.default(otpExpiry));
}
exports.isExpired = isExpired;
