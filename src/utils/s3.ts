import {
  PutObjectCommand,
  PutPublicAccessBlockCommand,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { s3Client } from '../aws';
import { organisationCORS } from '../const/aws/s3-cors';
import { organisationBucketPolicy } from '../const/aws/s3-bucket-policy';
import { config } from '../config';

export const _getSignedUrl = async (bucket: string) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: uuidv4(),
    Expires: dayjs().add(1, 'day').toDate()
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export const _createS3Bucket = async (bucket: string = uuidv4()) => {
  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: bucket,
        ACL: 'private'
      })
    );
    await s3Client.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucket,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true
        }
      })
    );
    const putResult = await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: organisationCORS
        }
      })
    );
    const bucketPolicy = {
      ...organisationBucketPolicy,
      Id: bucket,
      Statement: organisationBucketPolicy.Statement.map((statement) => {
        return {
          ...statement,
          Principal: {
            AWS: `arn:aws:iam::${config.awsAccountId}:user/${config.awsUser}`
          },
          Resource: `arn:aws:s3:::${bucket}/*`
        }
      })
    }
    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify(bucketPolicy)
      })
    );
    return bucket;
  } catch (error) {
    throw error;
  }
}