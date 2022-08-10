"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    questions: [{
            question: String,
            answerType: String,
            answer: String
        }],
    tasks: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'ProjectTask'
        }],
    manager: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User'
    },
    editors: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'User'
        }],
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
exports.Project = mongoose_1.default.model("Project", projectSchema);
exports.default = exports.Project;
