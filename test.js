var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();


ffmpeg.ffprobe('https://d2wy6g8ai2g2bx.cloudfront.net/859f3650-4908-41ad-8010-85a843332c0f.mov?Expires=1789903258&Key-Pair-Id=APKAJKBOG4DGERQ6DLHQ&Signature=Li-G1ToPg6BoW754fITXdQdLBSAAQKRHZQ9WhvNJK~dWl3GH2Aff~wPZpZehIgi-C4zLK47AmurweKmT7WBfb~1SPm6eUH~jXBN8Vwtw8u8LUvK129vVZlqn1XxyCrsLxoppjRDrYeX6~1ZANYG8u0h8NmjRaj5CafIoX-qZXd9K6u-myYQAiZyiAbhDHvYXHcSlrFYG3arzCqiUKq3633CPRZH8MDn1dCe1nu3Yr8m9Ce40R6Agvrn5Ub1-Opo5DfT5wdMJyyhvLEEPhar6e9gC8N6wPvF1xI3JAnNfSMYiXj4kJWe39P1I-~eVnYpn79aVNeRvS2ISCCw7IDHxcw__', function (err, metadata) {
  console.dir(metadata);
});