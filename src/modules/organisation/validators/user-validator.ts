import Joi from 'joi';
import { customEmailValidator } from '../../../utils/validator';
import { UserRole } from '../@types/user-enum';

export const userSignupSchema = Joi.object({
  email: Joi.string().custom(customEmailValidator),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  organisationName: Joi.string().required()
}).required();

export const addUserSchema = Joi.object({
  email: Joi.string().custom(customEmailValidator),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().required()
}).required();

export const userSigninSchema = Joi.object({
  email: Joi.string().custom(customEmailValidator),
  password: Joi.string().required()
}).required();

export const verifyOTPSchema = Joi.object({
  email: Joi.string().custom(customEmailValidator),
  otp: Joi.string().required().length(6) //TODO: add regex for number validation
}).required();

export const setPasswordSchema = Joi.object({
  password: Joi.string().min(8)
}).required();