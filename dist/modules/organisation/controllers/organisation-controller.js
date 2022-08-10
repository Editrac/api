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
exports.updateProjectTemplate = exports.getProjectTemplates = exports._createProjectTemplate = exports.createProjectTemplate = exports.updateOrganisation = exports.getOrganisations = exports.createOrganisation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dayjs_1 = __importDefault(require("dayjs"));
const http_status_1 = __importDefault(require("http-status"));
const winston_1 = __importDefault(require("../../../winston"));
const organisation_message_const_1 = require("../../../const/user/organisation-message-const");
const error_1 = __importDefault(require("../../../error"));
const user_model_1 = __importDefault(require("../models/user-model"));
const organisation_message_const_2 = require("../../../const/user/organisation-message-const");
const organisation_model_1 = require("../models/organisation-model");
const project_template_model_1 = require("../models/project-template-model");
const organisation_validator_1 = require("../validators/organisation-validator");
const otp_1 = require("../../../utils/otp");
const organisation_type_1 = require("../@types/organisation-type");
const email_mq_1 = require("../../../mqs/email/email-mq");
const cf_util_1 = require("../../../utils/cf-util");
exports.createOrganisation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield organisation_validator_1.createOrganisationSchema.validateAsync(req.body);
        const { organisationName, userEmail, userFirstName, userLastName } = req.body;
        const organisation = yield organisation_model_1.Organisation.findOne({ name: organisationName });
        if (organisation)
            throw new error_1.default(organisation_message_const_1.ORGANISATION_EXISTS, http_status_1.default.CONFLICT);
        const newUser = new user_model_1.default({
            email: userEmail,
            firstName: userFirstName,
            lastName: userLastName
        });
        const newOrganisation = new organisation_model_1.Organisation({ name: organisationName });
        newUser.organisation = newOrganisation._id;
        newUser.otp = otp_1.generateOtp();
        newUser.otpExpiry = dayjs_1.default().add(5, 'days').toISOString();
        newUser.organisationType = organisation_type_1.OrganisationType.PRODUCING;
        newOrganisation.organisationType = organisation_type_1.OrganisationType.PRODUCING;
        newOrganisation.editingOrgs.push(req.user.organisation);
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        yield newUser.save();
        yield newOrganisation.save();
        yield organisation_model_1.Organisation.findByIdAndUpdate(mongoose_1.default.Types.ObjectId(req.user.organisation), { $push: { producingOrgs: newOrganisation._id } });
        yield session.commitTransaction();
        session.endSession();
        try {
            yield email_mq_1.EmailQ.add({ type: email_mq_1.EmailQType.SEND_OTP, email: newUser.email, otp: newUser.otp });
        }
        catch (error) {
            winston_1.default.error(error.message);
        }
        return res.json({
            success: true,
            data: {
                organisation: newOrganisation
            },
            message: organisation_message_const_1.ORGANISATION_CREATE_SUCCESS
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.getOrganisations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationType } = req.user;
        const localField = organisationType === organisation_type_1.OrganisationType.PRODUCING ? "editingOrgs" : "producingOrgs";
        const organisation = yield organisation_model_1.Organisation.aggregate([
            {
                $match: {
                    _id: mongoose_1.default.Types.ObjectId(req.user.organisation)
                }
            },
            {
                $lookup: {
                    from: 'organisations',
                    localField,
                    foreignField: "_id",
                    as: "organisations"
                }
            }
        ]);
        const organisations = organisation.length ? organisation[0].organisations : [];
        return res.json({
            success: true,
            data: {
                organisations: organisations.map((org, index) => {
                    return Object.assign(Object.assign({}, org), { picture: org.picture ? cf_util_1.getSignedUrl(org.picture) : undefined });
                })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.updateOrganisation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId } = req.params;
        yield organisation_validator_1.updateOrganisationSchema.validateAsync(req.body);
        let organisation = yield organisation_model_1.Organisation.findById(organisationId);
        if (!organisation) {
            throw new error_1.default(organisation_message_const_1.ORGANISATION_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        organisation.name = req.body.organisationName;
        if (req.body.picture) {
            organisation.picture = req.body.picture;
        }
        yield organisation.save();
        return res.json({
            success: true,
            message: organisation_message_const_1.UPDATE_ORGANISATION_SUCCESSFUL,
            data: {
                organisation: Object.assign(Object.assign({}, organisation.toJSON()), { picture: organisation.picture ? cf_util_1.getSignedUrl(organisation.picture) : undefined })
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.createProjectTemplate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield organisation_validator_1.createUpdateProjectTemplateSchema.validateAsync(req.body);
        const { organisationId } = req.params;
        const newProjectTemplate = yield exports._createProjectTemplate(organisationId, req.body);
        return res.json({
            success: true,
            data: {
                projectTemplate: newProjectTemplate
            },
            message: organisation_message_const_2.PROJECT_TEMPLATE_CREATE_SUCCESS
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports._createProjectTemplate = (organisationId, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organisation = yield organisation_model_1.Organisation.findById(mongoose_1.default.Types.ObjectId(organisationId));
        if (!organisation)
            throw new error_1.default(organisation_message_const_1.ORGANISATION_NOT_FOUND, http_status_1.default.NOT_FOUND);
        const newProjectTemplate = new project_template_model_1.ProjectTemplate(Object.assign(Object.assign({}, body), { organisation: organisationId }));
        return yield newProjectTemplate.save();
    }
    catch (error) {
        throw error;
    }
});
exports.getProjectTemplates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organisationId } = req.params;
        const { organisationType, organisation: userOrg } = req.user;
        const editingOrg = organisationType === organisation_type_1.OrganisationType.EDITING ? userOrg : organisationId;
        const projectTemplates = yield project_template_model_1.ProjectTemplate.find({ organisation: mongoose_1.default.Types.ObjectId(editingOrg) });
        return res.json({
            success: true,
            data: {
                projectTemplates
            }
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
exports.updateProjectTemplate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pTemplateId } = req.params;
        yield organisation_validator_1.createUpdateProjectTemplateSchema.validateAsync(req.body);
        let projectTemplate = yield project_template_model_1.ProjectTemplate.findById(pTemplateId);
        if (!projectTemplate) {
            throw new error_1.default(organisation_message_const_2.PROJECT_TEMPLATE_NOT_FOUND, http_status_1.default.NOT_FOUND);
        }
        yield projectTemplate.update(Object.assign(Object.assign({}, projectTemplate.toObject()), req.body));
        return res.json({
            success: true,
            data: {
                projectTemplate: projectTemplate.toJSON()
            },
            message: organisation_message_const_2.PROJECT_TEMPLATE_UPDATE_SUCCESS
        });
    }
    catch (error) {
        winston_1.default.error(error.message);
        return next(error);
    }
});
