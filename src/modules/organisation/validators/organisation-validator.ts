import Joi from 'joi';
import { customEmailValidator } from '../../../utils/validator';

export const createOrganisationSchema = Joi.object({
  organisationName: Joi.string().required(),
  userEmail: Joi.string().custom(customEmailValidator),
  userFirstName: Joi.string().required(),
  userLastName: Joi.string().required(),
}).required();


export const createUpdateProjectTemplateSchema = Joi.object({
  name: Joi.string().required(),
  questions: Joi.array().min(1).items({
    question: Joi.string().required(),
    answerType: Joi.string().required(),
    required: Joi.boolean().required(),
    expectedAnswer: Joi.string().allow(""),
    options: Joi.array().min(0).items(Joi.string().optional()),
    errorMessage: Joi.string().allow("")
  })
}).required();

export const updateOrganisationSchema = Joi.object({
  organisationName: Joi.string().required(),
  picture: Joi.string().optional()
}).required();