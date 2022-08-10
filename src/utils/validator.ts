import { CustomValidator } from 'joi';
import mongoose from 'mongoose';
import validator from "validator";

export const customMongoObjectIdValidator: CustomValidator = (value, helper) => {
  if (!mongoose.isValidObjectId(value)) {
    return helper.error('any.invalid');
  }
  return value;
}

export const customEmailValidator: CustomValidator = (value, helper) => {
  if (!validator.isEmail(value)) {
    return helper.error('any.invalid');
  }
  return value;
}