"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ses = exports.s3ClientV2 = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const aws_sdk_1 = require("aws-sdk");
const config_1 = require("./config");
exports.s3Client = new client_s3_1.S3Client({
    region: config_1.config.awsRegion,
    credentials: {
        accessKeyId: config_1.config.awsAccessKeyId,
        secretAccessKey: config_1.config.awsSecretAccessKey
    }
});
exports.s3ClientV2 = new aws_sdk_1.S3({
    region: config_1.config.awsRegion,
    credentials: {
        accessKeyId: config_1.config.awsAccessKeyId,
        secretAccessKey: config_1.config.awsSecretAccessKey
    }
});
exports.ses = new aws_sdk_1.SES({
    region: config_1.config.awsRegion,
    accessKeyId: config_1.config.awsAccessKeyId,
    secretAccessKey: config_1.config.awsSecretAccessKey
});
