import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import mongoose from "mongoose";
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import axios from 'axios';
import logger from '../../../winston';
import { config } from '../../../config';
import { _getSignedUrl } from '../../../utils/s3';
import { addVideoToProjectTaskSchema } from '../validators/asset-validator';
import { ADD_VIDEO_TO_PROJECT_TASK_SUCCESSFULL } from '../../../const/project/asset-message-const';
import Project from '../models/project-model';
import dayjs from 'dayjs';
import { getSignedUrl, _getCloudflareSignedUrl } from '../../../utils/cf-util';
import ProjectTask from '../models/project-task-model';
import { getVideoQuality } from '../../../utils/video';

const ffprobePromise = (fileUrl: string): Promise<ffmpeg.FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(fileUrl, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      return resolve(metadata)
    })
  })
};

export const getSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const to_sign = req.query.to_sign as string;
    const datetime = req.query.datetime as string;
    const timestamp = datetime.substr(0, 8);
    const dateKey = hmac('AWS4' + config.awsSecretAccessKey, timestamp);
    const dateRegionKey = hmac(dateKey, config.awsRegion);
    const dateRegionServiceKey = hmac(dateRegionKey, 's3');
    const signingKey = hmac(dateRegionServiceKey, 'aws4_request');
    const signature = hmac(signingKey, to_sign).toString('hex');
    return res.send(signature);
    function hmac(key: string, string: string) {
      const hmac = crypto.createHmac('sha256', key);
      hmac.end(string);
      return hmac.read();
    }
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const getCloudflareSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.headers)
    const response = await axios(
      {
        url: `${config.cfStreamUrl}/accounts/${config.cfAccountId}/stream?direct_user=true`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.cfAccessToken}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': req.headers['upload-length'] as string,
          'Upload-Metadata': req.headers['upload-metadata'] as string
        },
      }
    );

    return res.header(
      {
        'Access-Control-Expose-Headers': 'Location,stream-media-id',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Location': response.headers['location'],
        'stream-media-id': response.headers['stream-media-id']
      }
    ).json();
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const addVideoToProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    await addVideoToProjectTaskSchema.validateAsync(req.body);
    const projectTask = await ProjectTask.findById(taskId);
    const fileUrl = await _getCloudflareSignedUrl(req.body.file);
    // const metadata = await ffprobePromise(fileUrl);
    // console.log(metadata)
    // const videoMetadata = metadata.streams.find((stream) => stream.codec_type === 'video');
    const video = {
      ...req.body,
      _id: mongoose.Types.ObjectId(),
      version: projectTask.videos.length + 1,
      uploadedAt: dayjs().toISOString(),
      user: req.user._id,
      // quality: getVideoQuality(videoMetadata.height),
      // codecName: videoMetadata.codec_name,
      // width: videoMetadata.width,
      // height: videoMetadata.height,
      duration: 0
    }
    projectTask.videos.push(video);
    await projectTask.save();
    return res.json({
      success: true,
      message: ADD_VIDEO_TO_PROJECT_TASK_SUCCESSFULL,
      data: {
        video: {
          ...video,
          file: fileUrl,
          comments: []
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}