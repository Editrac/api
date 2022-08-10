import Joi from 'joi';

export const addVideoToProjectTaskSchema = Joi.object({
  name: Joi.string().required(),
  file: Joi.string().required()
}).required();