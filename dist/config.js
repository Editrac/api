"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("./@types/enum");
// define validation for all the env vars
const envSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string()
        .allow(enum_1.Environment.Development, enum_1.Environment.Production, enum_1.Environment.Testing, enum_1.Environment.Staging)
        .default(enum_1.Environment.Development),
    PORT: joi_1.default.number()
        .default(4000),
    MONGOOSE_DEBUG: joi_1.default.boolean()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.boolean().default(true),
        otherwise: joi_1.default.boolean().default(false)
    }),
    JWT_SECRET: joi_1.default.string()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.string().default('jwtsecret'),
        otherwise: joi_1.default.string().required()
            .description('JWT secret required')
    }),
    MONGO_URI: joi_1.default.string()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.string().default('mongodb://localhost:27017/ediflo'),
        otherwise: joi_1.default.string().required()
            .description('Mongo db host url')
    }),
    REDIS_HOST: joi_1.default.string()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.string().default('localhost'),
        otherwise: joi_1.default.string().required()
            .description('Redis db host url')
    }),
    REDIS_PORT: joi_1.default.number()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.number().default(6379),
        otherwise: joi_1.default.number().required()
            .description('Rdis db port')
    }),
    REDIS_PASSWORD: joi_1.default.string()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.string().default(''),
        otherwise: joi_1.default.string().required()
            .description('Redis db password')
    }),
    REDIS_DB: joi_1.default.number()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.number().default(10),
        otherwise: joi_1.default.number().required()
            .description('Redis db name')
    }),
    AWS_ACCOUNT_ID: joi_1.default.string()
        .required()
        .description('AWS account id is required'),
    AWS_REGION: joi_1.default.string()
        .when('NODE_ENV', {
        is: joi_1.default.string().equal(enum_1.Environment.Development),
        then: joi_1.default.string().default('ap-south-1'),
        otherwise: joi_1.default.string().required()
            .description('AWS region is required')
    }),
    AWS_USER: joi_1.default.string()
        .required()
        .description('AWS user is required'),
    AWS_ACCESS_KEY_ID: joi_1.default.string()
        .required()
        .description('AWS acess key id is required'),
    AWS_SECRET_ACCESS_KEY: joi_1.default.string()
        .required()
        .description('AWS secret access key is required'),
    AWS_CF_ACCESS_KEY_ID: joi_1.default.string()
        .required()
        .description('AWS cloudfront access key id is required'),
    AWS_CF_PRIVATE_KEY: joi_1.default.string()
        .required()
        .description('AWS cloudfront private key is required'),
    AWS_CF_DOMAIN_NAME: joi_1.default.string()
        .required()
        .description('AWS cloudfront domain is required'),
    AWS_EMAIL_SENDER_ID: joi_1.default.string()
        .default('hello@ediflo.co'),
    CF_STREAM_URL: joi_1.default.string()
        .required()
        .description('Cloudflare stream url is required'),
    CF_ACCOUNT_ID: joi_1.default.string()
        .required()
        .description('Cloudflare account id required'),
    CF_ACCESS_TOKEN: joi_1.default.string()
        .required()
        .description('Cloudflare access token is required'),
}).unknown().required();
const { error, value: env } = envSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
exports.config = {
    env: env.NODE_ENV,
    port: env.PORT,
    mongooseDebug: env.MONGOOSE_DEBUG,
    jwtSecret: env.JWT_SECRET,
    mongoUri: env.MONGO_URI,
    awsAccountId: env.AWS_ACCOUNT_ID,
    awsUser: env.AWS_USER,
    awsRegion: env.AWS_REGION,
    awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    awsCloudFrontAccessKeyId: env.AWS_CF_ACCESS_KEY_ID,
    awsCloudFrontPrivateKey: Buffer.from(env.AWS_CF_PRIVATE_KEY, 'base64').toString(),
    awsCloudFrontDomain: env.AWS_CF_DOMAIN_NAME,
    awsEmailSenderId: env.AWS_EMAIL_SENDER_ID,
    cfStreamUrl: env.CF_STREAM_URL,
    cfAccountId: env.CF_ACCOUNT_ID,
    cfAccessToken: env.CF_ACCESS_TOKEN,
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB,
    }
};
