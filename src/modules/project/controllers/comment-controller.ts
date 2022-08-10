import { Request, Response, NextFunction } from "express";
import mongoose, { FilterQuery } from 'mongoose';
import logger from '../../../winston';
import { _getSignedUrl } from '../../../utils/s3';
import VideoComment from '../models/video-comment-model';
import { CREATE_VIDEO_COMMENT_SUCCESSFULL } from '../../../const/project/comment-message-const';
import { createVideoCommentSchema } from '../validators/comment-validator';
import ProjectTask from '../models/project-task-model';

export const createVideoComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    await createVideoCommentSchema.validateAsync(req.body);
    const videoComment = new VideoComment({
      ...req.body,
      video: videoId,
      user: req.user._id,
    });
    const session = await mongoose.startSession();
    session.startTransaction();
    await videoComment.save();
    await ProjectTask.findOneAndUpdate({
      "videos._id": mongoose.Types.ObjectId(videoId)
    }, { $push: { "videos.$.comments": videoComment._id } });
    await session.commitTransaction();
    session.endSession();
    return res.json({
      success: true,
      message: CREATE_VIDEO_COMMENT_SUCCESSFULL,
      data: {
        videoComment: {
          text: videoComment.text,
          _id: videoComment._id,
          visibility: videoComment.visibility,
          user: req.user,
          replies: [],
          video: videoComment.video,
          timestamp: videoComment.timestamp
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const getVideoComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const videoComments = await VideoComment.find({
      video: videoId
    }).populate('user');
    return res.json({ success: true, data: { videoComments } });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};