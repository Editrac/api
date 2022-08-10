import Joi from 'joi';

export const createVideoCommentSchema = Joi.object({
  text: Joi.string().required(),
  visibility: Joi.string().required(),
  timestamp: Joi.number().required(),
}).required();