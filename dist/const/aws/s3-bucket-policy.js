"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationBucketPolicy = void 0;
exports.organisationBucketPolicy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DefaultPolicy",
            "Effect": "Allow",
            "Action": [
                "s3:AbortMultipartUpload",
                "s3:ListMultipartUploadParts",
                "s3:GetObject",
                "s3:PutObject"
            ]
        }
    ]
};
