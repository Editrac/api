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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSetPassword = exports.verifyOTP = exports.userSignin = exports.getUsers = exports.updateUser = exports.getUser = exports.me = exports.addUser = exports.userSignup = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = __importDefault(require("../models/user-model"));
const user_validator_1 = require("../validators/user-validator");
const winston_1 = __importDefault(require("../../../winston"));
const otp_1 = require("../../../utils/otp");
const email_mq_1 = require("../../../mqs/email/email-mq");
const user_message_const_1 = require("../../../const/user/user-message-const");
const user_util_1 = require("../utils/user-util");
const error_1 = __importDefault(require("../../../error"));
const organisation_model_1 = require("../models/organisation-model");
const cf_util_1 = require("../../../utils/cf-util");
const organisation_controller_1 = require("./organisation-controller");
const project_message_const_1 = require("../../../const/project/project-message-const");
exports.userSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_validator_1.userSignupSchema.validateAsync(req.body);
        const _a = req.body, { organisationName } = _a, user = __rest(_a, ["organisationName"]);
        const existingUser = yield user_model_1.default.findOne({ email: user.email });
        if (existingUser) {
            throw new error_1.default(user_message_const_1.EXISTING_USER, http_status_1.default.CONFLICT);
        }
        const newUser = new user_model_1.default(user);
        const newOrganisation = new organisation_model_1.Organisation({ name: organisationName });
        newUser.organisation = newOrganisation._id;
        newUser.otp = otp_1.generateOtp();
        newUser.otpExpiry = dayjs_1.default().add(5, 'days').toISOString();
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        yield newUser.save();
        yield newOrganisation.save();
        yield session.commitTransaction();
        session.endSession();
        yield organisation_controller_1._createProjectTemplate(newOrganisation._id, project_message_const_1.DEFAULT_PROJECT_TEMPLATE);
        try {
            yield email_mq_1.EmailQ.add({ type: email_mq_1.EmailQType.SEND_OTP, email: newUser.email, otp: newUser.otp });
        }
        catch (error) {
            winston_1.default.error(error.message);
        }
        return res.json({ success: true, message: user_message_const_1.OTP_SENT });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.addUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_validator_1.addUserSchema.validateAsync(req.body);
        const user = req.body;
        const existingUser = yield user_model_1.default.findOne({ email: user.email });
        if (existingUser) {
            throw new error_1.default(user_message_const_1.EXISTING_USER, http_status_1.default.CONFLICT);
        }
        const newUser = new user_model_1.default(user);
        newUser.organisation = req.user.organisation;
        newUser.organisationType = req.user.organisationType;
        newUser.otp = otp_1.generateOtp();
        newUser.otpExpiry = dayjs_1.default().add(5, 'days').toISOString();
        yield newUser.save();
        try {
            yield email_mq_1.EmailQ.add({ type: email_mq_1.EmailQType.SEND_OTP, email: newUser.email, otp: newUser.otp });
        }
        catch (error) {
            winston_1.default.error(error.message);
        }
        return res.json({ success: true, message: user_message_const_1.ADD_USER_SUCCESSFULL });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.me = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ _id: mongoose_1.default.Types.ObjectId(req.user._id) }).populate('organisation');
        if (!user) {
            throw new error_1.default(user_message_const_1.USER_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        return res.json({
            success: true, data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    lastSignin: user.lastSignin,
                    emailVerified: user.emailVerified,
                    organisation: user.organisation,
                    organisationType: user.organisationType,
                    picture: user.picture ? cf_util_1.getSignedUrl(user.picture) : undefined
                }
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ _id: mongoose_1.default.Types.ObjectId(req.params.userId) }).populate('organisation');
        if (!user) {
            throw new error_1.default(user_message_const_1.USER_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        return res.json({
            success: true, data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    lastSignin: user.lastSignin,
                    emailVerified: user.emailVerified,
                    organisation: user.organisation,
                    organisationType: user.organisationType,
                    picture: user.picture ? cf_util_1.getSignedUrl(user.picture) : undefined
                }
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_model_1.default.findOne({ _id: mongoose_1.default.Types.ObjectId(req.params.userId) });
        if (!user) {
            throw new error_1.default(user_message_const_1.USER_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        yield user.update(Object.assign(Object.assign({}, user.toObject()), req.body));
        return res.json({
            success: true,
            message: user_message_const_1.UPDATE_USER_SUCCESSFULL,
            data: {
                user: Object.assign(Object.assign({}, user.toJSON()), { picture: user.picture ? cf_util_1.getSignedUrl(user.picture) : undefined })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({ organisation: req.user.organisation });
        return res.json({
            success: true, data: {
                users: users.map((user) => {
                    return {
                        _id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        lastSignin: user.lastSignin,
                        emailVerified: user.emailVerified,
                        organisation: user.organisation,
                        organisationType: user.organisationType
                    };
                })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.userSignin = ({ body }, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_validator_1.userSigninSchema.validateAsync(body);
        const { email, password } = body;
        const user = yield user_model_1.default.findOne({ email }).populate('organisation');
        if (!user)
            throw new error_1.default(user_message_const_1.USER_NOT_FOUND, http_status_1.default.NOT_FOUND);
        if (!user.password) {
            throw new error_1.default(user_message_const_1.NO_PASSWORD, http_status_1.default.NOT_FOUND);
        }
        const validPassword = yield user.comparePassword(password);
        if (!validPassword) {
            throw new error_1.default(user_message_const_1.INVALID_PASSWORD, http_status_1.default.BAD_REQUEST);
        }
        user.lastSignin = new Date();
        yield user.save();
        const { token, payload } = user_util_1.generateToken(user);
        return res.json({
            success: true,
            data: {
                token,
                user: Object.assign(Object.assign({}, payload), { organisation: Object.assign(Object.assign({}, user.organisation.toJSON()), { picture: user.organisation.picture ? cf_util_1.getSignedUrl(user.organisation.picture) : undefined }) })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.verifyOTP = ({ body }, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_validator_1.verifyOTPSchema.validateAsync(body);
        const { email, otp } = body;
        const user = yield user_model_1.default.findOne({ email }).populate('organisation');
        if (!user)
            throw new error_1.default(user_message_const_1.USER_NOT_FOUND, http_status_1.default.NOT_FOUND);
        if (otp_1.isExpired(user.otpExpiry))
            throw new error_1.default(user_message_const_1.OTP_EXPIRED, http_status_1.default.BAD_REQUEST);
        if (user && user.otp !== otp)
            throw new error_1.default(user_message_const_1.INVALID_OTP, http_status_1.default.BAD_REQUEST);
        const { token, payload } = user_util_1.generateToken(user);
        user.lastSignin = dayjs_1.default().toDate();
        user.emailVerified = true;
        yield user.save();
        return res.json({
            success: true,
            data: {
                token,
                user: Object.assign(Object.assign({}, payload), { organisation: user.organisation })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.userSetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_validator_1.setPasswordSchema.validateAsync(req.body);
        const user = yield user_model_1.default.findById(mongoose_1.default.Types.ObjectId(req.user._id));
        if (!user)
            throw new error_1.default(user_message_const_1.USER_NOT_FOUND, http_status_1.default.NOT_FOUND);
        user.password = req.body.password;
        yield user.save();
        return res.json({
            success: true,
            message: user_message_const_1.SET_PASSWORD_SUCCESSFULL
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
