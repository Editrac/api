"use strict";
const organisation_controller_1 = require("../controllers/organisation-controller");
module.exports = (app) => {
    app.route('/api/organisation')
        .get(organisation_controller_1.getOrganisations)
        .post(organisation_controller_1.createOrganisation);
    app.route('/api/organisation/:organisationId')
        .put(organisation_controller_1.updateOrganisation);
    app.route('/organisation/:organisationId/ptemplate')
        .get(organisation_controller_1.getProjectTemplates)
        .post(organisation_controller_1.createProjectTemplate);
    app.route('/organisation/:organisationId/ptemplate/:pTemplateId')
        .put(organisation_controller_1.updateProjectTemplate);
};
