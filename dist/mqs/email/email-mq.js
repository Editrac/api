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
exports.EmailQType = exports.EmailQ = void 0;
const bull_1 = __importDefault(require("bull"));
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const mq_1 = require("../../const/mq/mq");
const winston_1 = __importDefault(require("../../winston"));
const nodemailer_1 = require("../../nodemailer");
const email_subject_const_1 = require("../../const/email/email-subject-const");
exports.EmailQ = new bull_1.default(mq_1.MessageQueue.EmailQ, { redis: config_1.config.redis });
var EmailQType;
(function (EmailQType) {
    EmailQType["SEND_OTP"] = "SEND_OTP";
})(EmailQType = exports.EmailQType || (exports.EmailQType = {}));
;
exports.EmailQ.isReady().then(() => {
    exports.EmailQ.process(({ data: { type, email, otp } }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            switch (type) {
                case EmailQType.SEND_OTP:
                    try {
                        const html = pug_1.default.compileFile(path_1.default.resolve(`src/templates/user-otp.pug`))({
                            otp,
                            url: `https://app.ediflo.co/signup?email=${email}&step=2`
                        });
                        yield nodemailer_1.sendMail(email, email_subject_const_1.SEND_OTP_SUBJECT, html);
                    }
                    catch (error) {
                        throw error;
                    }
            }
            return Promise.resolve();
        }
        catch (error) {
            winston_1.default.error(error.message);
            return Promise.resolve();
        }
    }));
}).catch((err) => {
    winston_1.default.error(err.message);
});
exports.EmailQ.on('completed', ({ id }) => {
    winston_1.default.info(`${id} completed`);
});
exports.EmailQ.on('error', (err) => {
    winston_1.default.error(err.message);
});
