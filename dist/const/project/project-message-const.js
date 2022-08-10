"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROJECT_TEMPLATE = exports.UPDATE_PROJECT_TASK_STATUS_SUCCESSFULL = exports.ADD_EDITOR_TO_PROJECT_TASK_SUCCESSFULL = exports.ADD_MANAGER_TO_PROJECT_SUCCESSFULL = exports.UPDATE_PROJECT_TASK_SUCCESSFULL = exports.UPDATE_PROJECT_SUCCESSFULL = exports.PROJECT_TASK_NOT_FOUND = exports.PROJECT_NOT_FOUND = exports.CREATE_PROJECT_TASK_SUCCESSFULL = exports.CREATE_PROJECT_SUCCESSFULL = void 0;
const organisation_type_1 = require("../../modules/organisation/@types/organisation-type");
exports.CREATE_PROJECT_SUCCESSFULL = 'Project created successfully';
exports.CREATE_PROJECT_TASK_SUCCESSFULL = 'Task created successfully';
exports.PROJECT_NOT_FOUND = 'Project not found';
exports.PROJECT_TASK_NOT_FOUND = 'Task not found';
exports.UPDATE_PROJECT_SUCCESSFULL = 'Project updated successfully';
exports.UPDATE_PROJECT_TASK_SUCCESSFULL = 'Task updated successfully';
exports.ADD_MANAGER_TO_PROJECT_SUCCESSFULL = 'Manager added to project successfully';
exports.ADD_EDITOR_TO_PROJECT_TASK_SUCCESSFULL = 'Editor added to task successfully';
exports.UPDATE_PROJECT_TASK_STATUS_SUCCESSFULL = 'Task status updated successfully';
exports.DEFAULT_PROJECT_TEMPLATE = {
    name: 'Default',
    questions: [
        {
            question: "Raw file URL",
            answerType: organisation_type_1.AnswerType.TEXT,
            required: true,
            expectedAnswer: "",
            options: [],
            errorMessage: "Raw file URL is required."
        },
        {
            question: "Description",
            answerType: organisation_type_1.AnswerType.TEXT,
            required: true,
            expectedAnswer: "",
            options: [],
            errorMessage: "Description is required."
        }
    ]
};
