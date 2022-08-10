"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectTaskStatusSchema = exports.addEditorToProjectTaskSchema = exports.addManagerToProjectSchema = exports.updateProjectTaskSchema = exports.createProjectTaskSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createProjectSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    template: joi_1.default.string().required(),
    manager: joi_1.default.string(),
    questions: joi_1.default.array().min(1).items({
        question: joi_1.default.string().required(),
        answerType: joi_1.default.string().required(),
        answer: joi_1.default.string()
    })
}).required();
exports.updateProjectSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    template: joi_1.default.string().required(),
    manager: joi_1.default.string(),
    questions: joi_1.default.array().min(1).items({
        question: joi_1.default.string().required(),
        answerType: joi_1.default.string().required(),
        answer: joi_1.default.string()
    })
}).required();
exports.createProjectTaskSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().allow(''),
    editor: joi_1.default.string().required()
}).required();
exports.updateProjectTaskSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().allow(''),
    editor: joi_1.default.string().required()
}).required();
exports.addManagerToProjectSchema = joi_1.default.object({
    manager: joi_1.default.string().required()
}).required();
exports.addEditorToProjectTaskSchema = joi_1.default.object({
    editor: joi_1.default.string().required()
}).required();
exports.updateProjectTaskStatusSchema = joi_1.default.object({
    status: joi_1.default.string().required()
}).required();
