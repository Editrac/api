import { Request, Response, NextFunction } from "express";
import mongoose, { FilterQuery } from 'mongoose';
import logger from '../../../winston';
import { _getSignedUrl } from '../../../utils/s3';
import { addEditorToProjectTaskSchema, addManagerToProjectSchema, createProjectSchema, createProjectTaskSchema, updateProjectSchema, updateProjectTaskSchema, updateProjectTaskStatusSchema } from '../validators/project-validator';
import Project, { ProjectDocument } from '../models/project-model';
import { ADD_EDITOR_TO_PROJECT_TASK_SUCCESSFULL, ADD_MANAGER_TO_PROJECT_SUCCESSFULL, CREATE_PROJECT_SUCCESSFULL, CREATE_PROJECT_TASK_SUCCESSFULL, PROJECT_NOT_FOUND, PROJECT_TASK_NOT_FOUND, UPDATE_PROJECT_SUCCESSFULL, UPDATE_PROJECT_TASK_STATUS_SUCCESSFULL, UPDATE_PROJECT_TASK_SUCCESSFULL } from '../../../const/project/project-message-const';
import { UserRole } from '../../organisation/@types/user-enum';
import APIError from '../../../error';
import httpStatus from 'http-status';
import ProjectTask, { ProjectTaskDocument } from '../models/project-task-model';
import { getSignedUrl, _getCloudflareSignedUrl } from '../../../utils/cf-util';
import { OrganisationType } from '../../organisation/@types/organisation-type';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId } = req.params;
    const { organisationType, organisation: userOrg } = req.user;
    await createProjectSchema.validateAsync(req.body);
    const producingOrg = organisationType === OrganisationType.PRODUCING ? userOrg : organisationId;
    const editingOrg = organisationType === OrganisationType.EDITING ? userOrg : organisationId
    const project = new Project({ ...req.body, producingOrg, editingOrg });
    await project.save();
    return res.json({
      success: true,
      message: CREATE_PROJECT_SUCCESSFULL,
      data: {
        project
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const createProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId, projectId } = req.params;
    const { organisationType, organisation: userOrg } = req.user;
    const producingOrg = organisationType === OrganisationType.PRODUCING ? userOrg : organisationId;
    const editingOrg = organisationType === OrganisationType.EDITING ? userOrg : organisationId
    await createProjectTaskSchema.validateAsync(req.body);
    const projectTask = new ProjectTask({ ...req.body, producingOrg, editingOrg, project: projectId });
    const session = await mongoose.startSession();
    session.startTransaction();
    await projectTask.save();
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: projectTask._id, editors: projectTask.editor } });
    await session.commitTransaction();
    session.endSession();
    return res.json({
      success: true,
      message: CREATE_PROJECT_TASK_SUCCESSFULL,
      data: {
        projectTask
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id, role } = req.user;
    const { organisationId } = req.params;
    const query: FilterQuery<ProjectDocument> = { $or: [{ producingOrg: organisationId }, { editingOrg: organisationId }] };
    if (role === UserRole.PROJECT_MANAGER) {
      query.manager = _id
    }
    if (role === UserRole.EDITOR) {
      query.editors = { $in: _id }
    }
    const projects = await Project.find(query).populate('manager');
    return res.json({
      success: true, data: {
        projects
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const getProjectTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId, projectId } = req.params;
    const query: FilterQuery<ProjectTaskDocument> = { $or: [{ producingOrg: organisationId }, { editingOrg: organisationId }], project: projectId };
    const projectTasks = await ProjectTask.find(query).populate('editor');
    return res.json({
      success: true,
      data: {
        projectTasks
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('manager editors tasks');
    if (!project) {
      throw new APIError(PROJECT_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    return res.json({
      success: true, data: {
        project
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const getProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const projectTask = await ProjectTask.findById(taskId).populate('editor');
    if (!projectTask) {
      throw new APIError(PROJECT_TASK_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    const videos = [];
    for (const video of projectTask.toJSON().videos) {
      videos.push(
        {
          ...video,
          file: await _getCloudflareSignedUrl(video.file)
        }
      )
    }
    return res.json({
      success: true, data: {
        projectTask: {
          ...projectTask.toJSON(),
          videos
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    await updateProjectSchema.validateAsync(req.body);
    let project = await Project.findById(projectId);
    if (!project) {
      throw new APIError(PROJECT_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    await project.update({ ...project.toObject(), ...req.body });
    return res.json({
      success: true, message: UPDATE_PROJECT_SUCCESSFULL
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const updateProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    await updateProjectTaskSchema.validateAsync(req.body);
    let projectTask = await ProjectTask.findById(taskId);
    if (!projectTask) {
      throw new APIError(PROJECT_TASK_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    await projectTask.update({ ...projectTask.toObject(), ...req.body });
    return res.json({
      success: true, message: UPDATE_PROJECT_TASK_SUCCESSFULL
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const addManagerToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addManagerToProjectSchema.validateAsync(req.body);
    const { organisationId, projectId } = req.params;
    console.log("---------------", req.body.manager);

    await Project.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(projectId),
      organisation: organisationId
    }, { $set: { manager: req.body.manager } });
    return res.json({ success: true, message: ADD_MANAGER_TO_PROJECT_SUCCESSFULL });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const addEditorToProjectTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId, projectId, taskId } = req.params;
    await addEditorToProjectTaskSchema.validateAsync(req.body);
    const session = await mongoose.startSession();
    session.startTransaction();
    await ProjectTask.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(taskId),
      organisation: organisationId,
      project: projectId,
    }, { $set: { editor: req.body.editor } });
    await Project.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(projectId),
      organisation: organisationId,
    }, { $push: { editors: req.body.editor } });
    await session.commitTransaction();
    session.endSession();
    return res.json({ success: true, message: ADD_EDITOR_TO_PROJECT_TASK_SUCCESSFULL });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const updateProjectTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId, projectId, taskId } = req.params;
    await updateProjectTaskStatusSchema.validateAsync(req.body);
    await ProjectTask.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(taskId),
      $or: [{ producingOrg: organisationId }, { editingOrg: organisationId }],
      project: projectId,
    }, { $set: { status: req.body.status } });
    return res.json({ success: true, message: UPDATE_PROJECT_TASK_STATUS_SUCCESSFULL });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};