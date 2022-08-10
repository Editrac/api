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
exports._createS3Bucket = exports._getSignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const dayjs_1 = __importDefault(require("dayjs"));
const aws_1 = require("../aws");
const s3_cors_1 = require("../const/aws/s3-cors");
const s3_bucket_policy_1 = require("../const/aws/s3-bucket-policy");
const config_1 = require("../config");
exports._getSignedUrl = (bucket) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: uuid_1.v4(),
        Expires: dayjs_1.default().add(1, 'day').toDate()
    });
    return yield s3_request_presigner_1.getSignedUrl(aws_1.s3Client, command, { expiresIn: 3600 });
});
exports._createS3Bucket = (bucket = uuid_1.v4()) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield aws_1.s3Client.send(new client_s3_1.CreateBucketCommand({
            Bucket: bucket,
            ACL: 'private'
        }));
        yield aws_1.s3Client.send(new client_s3_1.PutPublicAccessBlockCommand({
            Bucket: bucket,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                IgnorePublicAcls: true,
                BlockPublicPolicy: true,
                RestrictPublicBuckets: true
            }
        }));
        const putResult = yield aws_1.s3Client.send(new client_s3_1.PutBucketCorsCommand({
            Bucket: bucket,
            CORSConfiguration: {
                CORSRules: s3_cors_1.organisationCORS
            }
        }));
        const bucketPolicy = Object.assign(Object.assign({}, s3_bucket_policy_1.organisationBucketPolicy), { Id: bucket, Statement: s3_bucket_policy_1.organisationBucketPolicy.Statement.map((statement) => {
                return Object.assign(Object.assign({}, statement), { Principal: {
                        AWS: `arn:aws:iam::${config_1.config.awsAccountId}:user/${config_1.config.awsUser}`
                    }, Resource: `arn:aws:s3:::${bucket}/*` });
            }) });
        yield aws_1.s3Client.send(new client_s3_1.PutBucketPolicyCommand({
            Bucket: bucket,
            Policy: JSON.stringify(bucketPolicy)
        }));
        return bucket;
    }
    catch (error) {
        throw error;
    }
});
