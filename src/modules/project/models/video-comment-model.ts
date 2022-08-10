import mongoose from "mongoose";
import { VideoCommentVisibility } from '../@types/comment-type';
import { IVideoComment } from '../@types/comment-type';

export type VideoCommentDocument = mongoose.Document & IVideoComment;

const videoCommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    required: true,
    enum: Object.values(VideoCommentVisibility)
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  replies: [{
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }],
  video: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export const VideoComment = mongoose.model<VideoCommentDocument>("VideoComment", videoCommentSchema);
export default VideoComment;