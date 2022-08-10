"use strict";
const project_controller_1 = require("../controllers/project-controller");
module.exports = (app) => {
    app.route('/api/organisation/:organisationId/project')
        .get(project_controller_1.getProjects)
        .post(project_controller_1.createProject);
    app.route('/api/organisation/:organisationId/project/:projectId')
        .get(project_controller_1.getProject)
        .put(project_controller_1.updateProject);
    app.route('/api/organisation/:organisationId/project/:projectId/manager')
        .post(project_controller_1.addManagerToProject);
    app.route('/api/organisation/:organisationId/project/:projectId/task')
        .get(project_controller_1.getProjectTasks)
        .post(project_controller_1.createProjectTask);
    app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId')
        .get(project_controller_1.getProjectTask)
        .put(project_controller_1.updateProjectTask);
    app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId/editor')
        .post(project_controller_1.addEditorToProjectTask);
    app.route('/api/organisation/:organisationId/project/:projectId/task/:taskId/status')
        .put(project_controller_1.updateProjectTaskStatus);
};
