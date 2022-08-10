import { Express } from "express";
import {
  addVideoToProjectTask,
  getCloudflareSignedUrl,
  getSignature,
} from "../controllers/asset-controller";

export = (app: Express) => {
  app.route('/api/signer')
    .get(getSignature);
  app.route('/api/cloudflare/signer')
    .post(getCloudflareSignedUrl)
  app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId/video')
    .post(addVideoToProjectTask);
}