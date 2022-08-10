import { Express } from "express";
import {
  createVideoComment,
  getVideoComments
} from "../controllers/comment-controller";

export = (app: Express) => {
  app.route('/api/video/:videoId/comment')
    .get(getVideoComments)
    .post(createVideoComment);
}