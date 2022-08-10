"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customEmailValidator = exports.customMongoObjectIdValidator = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
exports.customMongoObjectIdValidator = (value, helper) => {
    if (!mongoose_1.default.isValidObjectId(value)) {
        return helper.error('any.invalid');
    }
    return value;
};
exports.customEmailValidator = (value, helper) => {
    if (!validator_1.default.isEmail(value)) {
        return helper.error('any.invalid');
    }
    return value;
};
