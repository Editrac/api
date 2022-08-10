"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPasswordSchema = exports.verifyOTPSchema = exports.userSigninSchema = exports.addUserSchema = exports.userSignupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validator_1 = require("../../../utils/validator");
exports.userSignupSchema = joi_1.default.object({
    email: joi_1.default.string().custom(validator_1.customEmailValidator),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    organisationName: joi_1.default.string().required()
}).required();
exports.addUserSchema = joi_1.default.object({
    email: joi_1.default.string().custom(validator_1.customEmailValidator),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    role: joi_1.default.string().required()
}).required();
exports.userSigninSchema = joi_1.default.object({
    email: joi_1.default.string().custom(validator_1.customEmailValidator),
    password: joi_1.default.string().required()
}).required();
exports.verifyOTPSchema = joi_1.default.object({
    email: joi_1.default.string().custom(validator_1.customEmailValidator),
    otp: joi_1.default.string().required().length(6) //TODO: add regex for number validation
}).required();
exports.setPasswordSchema = joi_1.default.object({
    password: joi_1.default.string().min(8)
}).required();
