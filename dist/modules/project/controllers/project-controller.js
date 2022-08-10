"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectTaskStatus = exports.addEditorToProjectTask = exports.addManagerToProject = exports.updateProjectTask = exports.updateProject = exports.getProjectTask = exports.getProject = exports.getProjectTasks = exports.getProjects = exports.createProjectTask = exports.createProject = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const winston_1 = __importDefault(require("../../../winston"));
const project_validator_1 = require("../validators/project-validator");
const project_model_1 = __importDefault(require("../models/project-model"));
const project_message_const_1 = require("../../../const/project/project-message-const");
const user_enum_1 = require("../../organisation/@types/user-enum");
const error_1 = __importDefault(require("../../../error"));
const http_status_1 = __importDefault(require("http-status"));
const project_task_model_1 = __importDefault(require("../models/project-task-model"));
const cf_util_1 = require("../../../utils/cf-util");
const organisation_type_1 = require("../../organisation/@types/organisation-type");
exports.createProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId } = req.params;
        const { organisationType, organisation: userOrg } = req.user;
        yield project_validator_1.createProjectSchema.validateAsync(req.body);
        const producingOrg = organisationType === organisation_type_1.OrganisationType.PRODUCING ? userOrg : organisationId;
        const editingOrg = organisationType === organisation_type_1.OrganisationType.EDITING ? userOrg : organisationId;
        const project = new project_model_1.default(Object.assign(Object.assign({}, req.body), { producingOrg, editingOrg }));
        yield project.save();
        return res.json({
            success: true,
            message: project_message_const_1.CREATE_PROJECT_SUCCESSFULL,
            data: {
                project
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.createProjectTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId, projectId } = req.params;
        const { organisationType, organisation: userOrg } = req.user;
        const producingOrg = organisationType === organisation_type_1.OrganisationType.PRODUCING ? userOrg : organisationId;
        const editingOrg = organisationType === organisation_type_1.OrganisationType.EDITING ? userOrg : organisationId;
        yield project_validator_1.createProjectTaskSchema.validateAsync(req.body);
        const projectTask = new project_task_model_1.default(Object.assign(Object.assign({}, req.body), { producingOrg, editingOrg, project: projectId }));
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        yield projectTask.save();
        yield project_model_1.default.findByIdAndUpdate(projectId, { $push: { tasks: projectTask._id, editors: projectTask.editor } });
        yield session.commitTransaction();
        session.endSession();
        return res.json({
            success: true,
            message: project_message_const_1.CREATE_PROJECT_TASK_SUCCESSFULL,
            data: {
                projectTask
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, role } = req.user;
        const { organisationId } = req.params;
        const query = { $or: [{ producingOrg: organisationId }, { editingOrg: organisationId }] };
        if (role === user_enum_1.UserRole.PROJECT_MANAGER) {
            query.manager = _id;
        }
        if (role === user_enum_1.UserRole.EDITOR) {
            query.editors = { $in: _id };
        }
        const projects = yield project_model_1.default.find(query);
        return res.json({
            success: true, data: {
                projects
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getProjectTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId, projectId } = req.params;
        const query = { $or: [{ producingOrg: organisationId }, { editingOrg: organisationId }], project: projectId };
        const projectTasks = yield project_task_model_1.default.find(query).populate('editor');
        return res.json({
            success: true,
            data: {
                projectTasks
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const project = yield project_model_1.default.findById(projectId).populate('manager editors tasks');
        if (!project) {
            throw new error_1.default(project_message_const_1.PROJECT_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        return res.json({
            success: true, data: {
                project
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getProjectTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        const projectTask = yield project_task_model_1.default.findById(taskId).populate('editor');
        if (!projectTask) {
            throw new error_1.default(project_message_const_1.PROJECT_TASK_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        const videos = [];
        for (const video of projectTask.toJSON().videos) {
            videos.push(Object.assign(Object.assign({}, video), { file: yield cf_util_1._getCloudflareSignedUrl(video.file) }));
        }
        return res.json({
            success: true,
            data: {
                projectTask: Object.assign(Object.assign({}, projectTask.toJSON()), { videos })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.updateProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        yield project_validator_1.updateProjectSchema.validateAsync(req.body);
        let project = yield project_model_1.default.findById(projectId);
        if (!project) {
            throw new error_1.default(project_message_const_1.PROJECT_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        yield project.update(Object.assign(Object.assign({}, project.toObject()), req.body));
        return res.json({
            success: true, message: project_message_const_1.UPDATE_PROJECT_SUCCESSFULL
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.updateProjectTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        yield project_validator_1.updateProjectTaskSchema.validateAsync(req.body);
        let projectTask = yield project_task_model_1.default.findById(taskId);
        if (!projectTask) {
            throw new error_1.default(project_message_const_1.PROJECT_TASK_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        yield projectTask.update(Object.assign(Object.assign({}, projectTask.toObject()), req.body));
        return res.json({
            success: true, message: project_message_const_1.UPDATE_PROJECT_TASK_SUCCESSFULL
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.addManagerToProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield project_validator_1.addManagerToProjectSchema.validateAsync(req.body);
        const { organisationId, projectId } = req.params;
        yield project_model_1.default.findOneAndUpdate({
            _id: mongoose_1.default.Types.ObjectId(projectId),
            organisation: organisationId
        }, { $set: { manager: req.body.manager } });
        return res.json({ success: true, message: project_message_const_1.ADD_MANAGER_TO_PROJECT_SUCCESSFULL });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.addEditorToProjectTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId, projectId, taskId } = req.params;
        yield project_validator_1.addEditorToProjectTaskSchema.validateAsync(req.body);
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        yield project_task_model_1.default.findOneAndUpdate({
            _id: mongoose_1.default.Types.ObjectId(taskId),
            organisation: organisationId,
            project: projectId,
        }, { $set: { editor: req.body.editor } });
        yield project_model_1.default.findOneAndUpdate({
            _id: mongoose_1.default.Types.ObjectId(projectId),
            organisation: organisationId,
        }, { $push: { editors: req.body.editor } });
        yield session.commitTransaction();
        session.endSession();
        return res.json({ success: true, message: project_message_const_1.ADD_EDITOR_TO_PROJECT_TASK_SUCCESSFULL });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.updateProjectTaskStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId, projectId, taskId } = req.params;
        yield project_validator_1.updateProjectTaskStatusSchema.validateAsync(req.body);
        yield project_task_model_1.default.findOneAndUpdate({
            _id: mongoose_1.default.Types.ObjectId(taskId),
            $or: [{ producingOrg: organisationId }, { editingOrg: organisationId }],
            project: projectId,
        }, { $set: { status: req.body.status } });
        return res.json({ success: true, message: project_message_const_1.UPDATE_PROJECT_TASK_STATUS_SUCCESSFULL });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
