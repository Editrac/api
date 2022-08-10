"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTemplate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const organisation_type_1 = require("../@types/organisation-type");
const projectTemplateSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    questions: [
        {
            _id: false,
            answerType: {
                type: String,
                enum: Object.values(organisation_type_1.AnswerType)
            },
            question: String,
            required: Boolean,
            expectedAnswer: String,
            options: [],
            errorMessage: String,
        }
    ],
    organisation: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Organisation',
        required: true
    },
}, { timestamps: true });
exports.ProjectTemplate = mongoose_1.default.model("ProjectTemplate", projectTemplateSchema);
