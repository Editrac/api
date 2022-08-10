import { Express } from "express";
import { createProject, getProjects, addManagerToProject, getProject, updateProject, addEditorToProjectTask, getProjectTasks, updateProjectTask, createProjectTask, getProjectTask, updateProjectTaskStatus } from '../controllers/project-controller';

export = (app: Express) => {
  app.route('/api/organisation/:organisationId/project')
    .get(getProjects)
    .post(createProject);

  app.route('/api/organisation/:organisationId/project/:projectId')
    .get(getProject)
    .put(updateProject);

  app.route('/api/organisation/:organisationId/project/:projectId/manager')
    .post(addManagerToProject);

  app.route('/api/organisation/:organisationId/project/:projectId/task')
    .get(getProjectTasks)
    .post(createProjectTask);

  app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId')
    .get(getProjectTask)
    .put(updateProjectTask);

  app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId/editor')
    .post(addEditorToProjectTask);

  app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId/status')
    .put(updateProjectTaskStatus);
}