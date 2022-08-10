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
exports.addVideoToProjectTask = exports.getCloudflareSignedUrl = exports.getSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const axios_1 = __importDefault(require("axios"));
const winston_1 = __importDefault(require("../../../winston"));
const config_1 = require("../../../config");
const asset_validator_1 = require("../validators/asset-validator");
const asset_message_const_1 = require("../../../const/project/asset-message-const");
const dayjs_1 = __importDefault(require("dayjs"));
const cf_util_1 = require("../../../utils/cf-util");
const project_task_model_1 = __importDefault(require("../models/project-task-model"));
const ffprobePromise = (fileUrl) => {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(fileUrl, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            return resolve(metadata);
        });
    });
};
exports.getSignature = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const to_sign = req.query.to_sign;
        const datetime = req.query.datetime;
        const timestamp = datetime.substr(0, 8);
        const dateKey = hmac('AWS4' + config_1.config.awsSecretAccessKey, timestamp);
        const dateRegionKey = hmac(dateKey, config_1.config.awsRegion);
        const dateRegionServiceKey = hmac(dateRegionKey, 's3');
        const signingKey = hmac(dateRegionServiceKey, 'aws4_request');
        const signature = hmac(signingKey, to_sign).toString('hex');
        return res.send(signature);
        function hmac(key, string) {
            const hmac = crypto_1.default.createHmac('sha256', key);
            hmac.end(string);
            return hmac.read();
        }
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getCloudflareSignedUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.headers);
        const response = yield axios_1.default({
            url: `${config_1.config.cfStreamUrl}/accounts/${config_1.config.cfAccountId}/stream?direct_user=true`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config_1.config.cfAccessToken}`,
                'Tus-Resumable': '1.0.0',
                'Upload-Length': req.headers['upload-length'],
                'Upload-Metadata': req.headers['upload-metadata']
            },
        });
        return res.header({
            'Access-Control-Expose-Headers': 'Location,stream-media-id',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Location': response.headers['location'],
            'stream-media-id': response.headers['stream-media-id']
        }).json();
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.addVideoToProjectTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        yield asset_validator_1.addVideoToProjectTaskSchema.validateAsync(req.body);
        const projectTask = yield project_task_model_1.default.findById(taskId);
        const fileUrl = yield cf_util_1._getCloudflareSignedUrl(req.body.file);
        // const metadata = await ffprobePromise(fileUrl);
        // console.log(metadata)
        // const videoMetadata = metadata.streams.find((stream) => stream.codec_type === 'video');
        const video = Object.assign(Object.assign({}, req.body), { _id: mongoose_1.default.Types.ObjectId(), version: projectTask.videos.length + 1, uploadedAt: dayjs_1.default().toISOString(), user: req.user._id, 
            // quality: getVideoQuality(videoMetadata.height),
            // codecName: videoMetadata.codec_name,
            // width: videoMetadata.width,
            // height: videoMetadata.height,
            duration: 0 });
        projectTask.videos.push(video);
        yield projectTask.save();
        return res.json({
            success: true,
            message: asset_message_const_1.ADD_VIDEO_TO_PROJECT_TASK_SUCCESSFULL,
            data: {
                video: Object.assign(Object.assign({}, video), { file: fileUrl, comments: [] })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
