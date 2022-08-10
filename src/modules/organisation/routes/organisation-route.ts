import { Express } from "express";
import {
  createOrganisation, createProjectTemplate, getOrganisations, getProjectTemplates, updateProjectTemplate, updateOrganisation
} from "../controllers/organisation-controller";

export = (app: Express) => {
  app.route('/api/organisation')
    .get(getOrganisations)
    .post(createOrganisation);

  app.route('/api/organisation/:organisationId')
    .put(updateOrganisation);

  app.route('/organisation/:organisationId/ptemplate')
    .get(getProjectTemplates)
    .post(createProjectTemplate)

  app.route('/organisation/:organisationId/ptemplate/:pTemplateId')
    .put(updateProjectTemplate)
}