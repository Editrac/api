import Joi from 'joi';

export const createProjectSchema = Joi.object({
  name: Joi.string().required(),
  template: Joi.string().required(),
  manager: Joi.string(),
  questions: Joi.array().min(1).items({
    question: Joi.string().required(),
    answerType: Joi.string().required(),
    answer: Joi.string()
  })
}).required();

export const updateProjectSchema = Joi.object({
  name: Joi.string().required(),
  template: Joi.string().required(),
  manager: Joi.string(),
  questions: Joi.array().min(1).items({
    question: Joi.string().required(),
    answerType: Joi.string().required(),
    answer: Joi.string()
  })
}).required();

export const createProjectTaskSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  editor: Joi.string().required()
}).required();

export const updateProjectTaskSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  editor: Joi.string().required()
}).required();

export const addManagerToProjectSchema = Joi.object({
  manager: Joi.string().required()
}).required();

export const addEditorToProjectTaskSchema = Joi.object({
  editor: Joi.string().required()
}).required();

export const updateProjectTaskStatusSchema = Joi.object({
  status: Joi.string().required()
}).required();