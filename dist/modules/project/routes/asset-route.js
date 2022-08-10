"use strict";
const asset_controller_1 = require("../controllers/asset-controller");
module.exports = (app) => {
    app.route('/api/signer')
        .get(asset_controller_1.getSignature);
    app.route('/api/cloudflare/signer')
        .post(asset_controller_1.getCloudflareSignedUrl);
    app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId/video')
        .post(asset_controller_1.addVideoToProjectTask);
};
