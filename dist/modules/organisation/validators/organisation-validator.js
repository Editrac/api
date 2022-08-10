"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganisationSchema = exports.createUpdateProjectTemplateSchema = exports.createOrganisationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validator_1 = require("../../../utils/validator");
exports.createOrganisationSchema = joi_1.default.object({
    organisationName: joi_1.default.string().required(),
    userEmail: joi_1.default.string().custom(validator_1.customEmailValidator),
    userFirstName: joi_1.default.string().required(),
    userLastName: joi_1.default.string().required(),
}).required();
exports.createUpdateProjectTemplateSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    questions: joi_1.default.array().min(1).items({
        question: joi_1.default.string().required(),
        answerType: joi_1.default.string().required(),
        required: joi_1.default.boolean().required(),
        expectedAnswer: joi_1.default.string().allow(""),
        options: joi_1.default.array().min(0).items(joi_1.default.string().optional()),
        errorMessage: joi_1.default.string().allow("")
    })
}).required();
exports.updateOrganisationSchema = joi_1.default.object({
    organisationName: joi_1.default.string().required(),
    picture: joi_1.default.string().optional()
}).required();
