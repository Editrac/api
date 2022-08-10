import Joi from 'joi';
import { Environment } from './@types/enum';

// define validation for all the env vars
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(Environment.Development, Environment.Production, Environment.Testing, Environment.Staging)
    .default(Environment.Development),
  PORT: Joi.number()
    .default(4000),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.string().default('jwtsecret'),
      otherwise: Joi.string().required()
        .description('JWT secret required')
    }),
  MONGO_URI: Joi.string()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.string().default('mongodb://localhost:27017/ediflo'),
      otherwise: Joi.string().required()
        .description('Mongo db host url')
    }),
  REDIS_HOST: Joi.string()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.string().default('localhost'),
      otherwise: Joi.string().required()
        .description('Redis db host url')
    }),
  REDIS_PORT: Joi.number()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.number().default(6379),
      otherwise: Joi.number().required()
        .description('Rdis db port')
    }),
  REDIS_PASSWORD: Joi.string()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.string().default(''),
      otherwise: Joi.string().required()
        .description('Redis db password')
    }),
  REDIS_DB: Joi.number()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.number().default(10),
      otherwise: Joi.number().required()
        .description('Redis db name')
    }),
  AWS_ACCOUNT_ID: Joi.string()
    .required()
    .description('AWS account id is required'),
  AWS_REGION: Joi.string()
    .when('NODE_ENV', {
      is: Joi.string().equal(Environment.Development),
      then: Joi.string().default('ap-south-1'),
      otherwise: Joi.string().required()
        .description('AWS region is required')
    }),
  AWS_USER: Joi.string()
    .required()
    .description('AWS user is required'),
  AWS_ACCESS_KEY_ID: Joi.string()
    .required()
    .description('AWS acess key id is required'),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required()
    .description('AWS secret access key is required'),
  AWS_CF_ACCESS_KEY_ID: Joi.string()
    .required()
    .description('AWS cloudfront access key id is required'),
  AWS_CF_PRIVATE_KEY: Joi.string()
    .required()
    .description('AWS cloudfront private key is required'),
  AWS_CF_DOMAIN_NAME: Joi.string()
    .required()
    .description('AWS cloudfront domain is required'),
  AWS_EMAIL_SENDER_ID: Joi.string()
    .default('hello@ediflo.co'),
  CF_STREAM_URL: Joi.string()
    .required()
    .description('Cloudflare stream url is required'),
  CF_ACCOUNT_ID: Joi.string()
    .required()
    .description('Cloudflare account id required'),
  CF_ACCESS_TOKEN: Joi.string()
    .required()
    .description('Cloudflare access token is required'),
}).unknown().required();

const { error, value: env } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
export const config = {
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
