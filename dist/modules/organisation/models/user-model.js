"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../@types/user-enum");
const organisation_type_1 = require("../@types/organisation-type");
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    otp: String,
    otpExpiry: Date,
    lastSignin: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    password: String,
    picture: String,
    organisation: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Organisation',
        required: true
    },
    organisationType: {
        type: String,
        default: organisation_type_1.OrganisationType.EDITING,
        enum: Object.values(organisation_type_1.OrganisationType)
    },
    role: {
        type: String,
        default: user_enum_1.UserRole.ADMIN,
        enum: Object.values(user_enum_1.UserRole)
    }
}, { timestamps: true });
/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt_1.default.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt_1.default.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            return next();
        });
    });
});
const comparePassword = function (password) {
    const user = this;
    return bcrypt_1.default.compare(password, user.password);
};
userSchema.methods.comparePassword = comparePassword;
userSchema.index({ email: 1, organisation: 1 }, { unique: true });
exports.User = mongoose_1.default.model("User", userSchema);
exports.default = exports.User;
