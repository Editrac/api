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
exports.getVideoComments = exports.createVideoComment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const winston_1 = __importDefault(require("../../../winston"));
const video_comment_model_1 = __importDefault(require("../models/video-comment-model"));
const comment_message_const_1 = require("../../../const/project/comment-message-const");
const comment_validator_1 = require("../validators/comment-validator");
const project_task_model_1 = __importDefault(require("../models/project-task-model"));
exports.createVideoComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId } = req.params;
        yield comment_validator_1.createVideoCommentSchema.validateAsync(req.body);
        const videoComment = new video_comment_model_1.default(Object.assign(Object.assign({}, req.body), { video: videoId, user: req.user._id }));
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        yield videoComment.save();
        yield project_task_model_1.default.findOneAndUpdate({
            "videos._id": mongoose_1.default.Types.ObjectId(videoId)
        }, { $push: { "videos.$.comments": videoComment._id } });
        yield session.commitTransaction();
        session.endSession();
        return res.json({
            success: true,
            message: comment_message_const_1.CREATE_VIDEO_COMMENT_SUCCESSFULL,
            data: {
                videoComment: {
                    text: videoComment.text,
                    _id: videoComment._id,
                    visibility: videoComment.visibility,
                    user: req.user,
                    replies: [],
                    video: videoComment.video,
                    timestamp: videoComment.timestamp
                }
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getVideoComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId } = req.params;
        const videoComments = yield video_comment_model_1.default.find({
            video: videoId
        }).populate('user');
        return res.json({ success: true, data: { videoComments } });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
