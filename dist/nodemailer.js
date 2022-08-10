"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = require("nodemailer");
const aws_1 = require("./aws");
const config_1 = require("./config");
const winston_1 = __importDefault(require("./winston"));
const tranporter = nodemailer_1.createTransport({
    SES: aws_1.ses
});
exports.sendMail = (to, subject, html, attachments = []) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield tranporter.sendMail({
            from: config_1.config.awsEmailSenderId,
            to,
            subject,
            attachments,
            html,
            textEncoding: "base64",
        });
    }
    catch (error) {
        winston_1.default.error(error);
        throw error;
    }
});
