"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoQuality = void 0;
exports.getVideoQuality = (height) => {
    if (height >= 4320) {
        return 'FUHD';
    }
    if (height >= 2160) {
        return 'UHD';
    }
    if (height >= 1440) {
        return 'QHD';
    }
    if (height >= 1080) {
        return 'FHD';
    }
    if (height >= 720) {
        return 'HD';
    }
    if (height >= 480) {
        return 'SD';
    }
};
