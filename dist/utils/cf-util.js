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
exports._getCloudflareSignedUrl = exports.getSignedUrl = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
exports.getSignedUrl = (filekey, expiryTime = 1825 * 24 * 60 * 60 * 1000) => {
    const signer = new aws_sdk_1.default.CloudFront.Signer(config_1.config.awsCloudFrontAccessKeyId, config_1.config.awsCloudFrontPrivateKey);
    return signer.getSignedUrl({
        url: `${config_1.config.awsCloudFrontDomain}/${filekey}`,
        expires: Math.floor((Date.now() + expiryTime) / 1000)
    });
};
exports._getCloudflareSignedUrl = (filekey, expiryTime = 1825 * 24 * 60 * 60 * 1000) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const response = yield axios_1.default(`${config_1.config.cfStreamUrl}/accounts/${config_1.config.cfAccountId}/stream/${filekey}/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config_1.config.cfAccessToken}`
        }
    });
    console.log(response.data.result.token);
    return `https://cloudflarestream.com/${(_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.token}/manifest/video.m3u8`;
});
