import { S3Client } from '@aws-sdk/client-s3';
import { SES, S3 } from 'aws-sdk';
import { config } from './config';

export const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey
  }
});

export const s3ClientV2 = new S3({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey
  }
});

export const ses = new SES({
  region: config.awsRegion,
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey
});