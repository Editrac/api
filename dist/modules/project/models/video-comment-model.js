"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoComment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const comment_type_1 = require("../@types/comment-type");
const videoCommentSchema = new mongoose_1.default.Schema({
    text: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        required: true,
        enum: Object.values(comment_type_1.VideoCommentVisibility)
    },
    user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User',
        required: true
    },
    replies: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'User'
        }],
    video: {
        type: mongoose_1.default.Types.ObjectId,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    }
}, { timestamps: true });
exports.VideoComment = mongoose_1.default.model("VideoComment", videoCommentSchema);
exports.default = exports.VideoComment;
