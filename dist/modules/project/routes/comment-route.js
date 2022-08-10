"use strict";
const comment_controller_1 = require("../controllers/comment-controller");
module.exports = (app) => {
    app.route('/api/video/:videoId/comment')
        .get(comment_controller_1.getVideoComments)
        .post(comment_controller_1.createVideoComment);
};
