"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const config_1 = require("../../../config");
exports.generateToken = (user) => {
    const organisation = user.organisation;
    const payload = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lastSignin: user.lastSignin,
        emailVerified: user.emailVerified,
        organisation: organisation._id,
        organisationType: user.organisationType
    };
    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
        expiresIn: moment_1.default().endOf('D').add(5, 'day').unix() - moment_1.default().unix()
    });
    return { token, payload };
};
