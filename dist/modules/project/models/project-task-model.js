"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTask = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const project_type_1 = require("../@types/project-type");
const projectTaskSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    videos: [{
            name: {
                type: String,
                required: true
            },
            file: {
                type: String,
                required: true
            },
            version: {
                type: Number,
                required: true
            },
            uploadedAt: {
                type: Date
            },
            user: {
                type: mongoose_1.default.Types.ObjectId,
                ref: 'User'
            },
            quality: String,
            codecName: String,
            width: Number,
            height: Number,
            duration: Number,
            comments: [
                {
                    type: mongoose_1.default.Types.ObjectId,
                    ref: 'VideoComment'
                }
            ]
        }],
    editor: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: project_type_1.ProjectTaskStatus.IN_PROGRESS,
        enum: Object.values(project_type_1.ProjectTaskStatus)
    },
    project: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    producingOrg: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Organisation',
        required: true
    },
    editingOrg: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Organisation',
        required: true
    }
}, { timestamps: true });
exports.ProjectTask = mongoose_1.default.model("ProjectTask", projectTaskSchema);
exports.default = exports.ProjectTask;
