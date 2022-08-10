import { Request, Response, NextFunction } from "express";
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import User, { UserDocument } from '../models/user-model';
import { addUserSchema, setPasswordSchema, userSigninSchema, userSignupSchema, verifyOTPSchema } from "../validators/user-validator";
import logger from '../../../winston';
import { generateOtp, isExpired } from '../../../utils/otp';
import { EmailQ, EmailQType } from '../../../mqs/email/email-mq';
import {
  ADD_USER_SUCCESSFULL,
  EXISTING_USER,
  INVALID_OTP,
  INVALID_PASSWORD,
  NO_PASSWORD,
  OTP_EXPIRED,
  OTP_SENT,
  SET_PASSWORD_SUCCESSFULL,
  UPDATE_USER_SUCCESSFULL,
  USER_NOT_FOUND
} from '../../../const/user/user-message-const';
import { generateToken } from '../utils/user-util';
import APIError from '../../../error';
import { Organisation, OrganisationDocument } from '../models/organisation-model';
import { getSignedUrl } from '../../../utils/cf-util';
import { _createProjectTemplate } from './organisation-controller';
import { DEFAULT_PROJECT_TEMPLATE } from '../../../const/project/project-message-const';

export const userSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userSignupSchema.validateAsync(req.body);
    const { organisationName, ...user } = req.body;
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      throw new APIError(EXISTING_USER, httpStatus.CONFLICT);
    }
    const newUser = new User(user);
    const newOrganisation = new Organisation({ name: organisationName });
    newUser.organisation = newOrganisation._id;
    newUser.otp = generateOtp();
    newUser.otpExpiry = dayjs().add(5, 'days').toISOString();
    const session = await mongoose.startSession();
    session.startTransaction();
    await newUser.save();
    await newOrganisation.save();
    await session.commitTransaction();
    session.endSession();
    await _createProjectTemplate(newOrganisation._id, DEFAULT_PROJECT_TEMPLATE)
    try {
      await EmailQ.add({ type: EmailQType.SEND_OTP, email: newUser.email, otp: newUser.otp });
    } catch (error) {
      logger.error(error.message);
    }
    return res.json({ success: true, message: OTP_SENT });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addUserSchema.validateAsync(req.body);
    const user = req.body;
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      throw new APIError(EXISTING_USER, httpStatus.CONFLICT);
    }
    const newUser = new User(user);
    newUser.organisation = req.user.organisation;
    newUser.organisationType = req.user.organisationType;
    newUser.otp = generateOtp();
    newUser.otpExpiry = dayjs().add(5, 'days').toISOString();
    await newUser.save();
    try {
      await EmailQ.add({ type: EmailQType.SEND_OTP, email: newUser.email, otp: newUser.otp })
    } catch (error) {
      logger.error(error.message);
    }
    return res.json({ success: true, message: ADD_USER_SUCCESSFULL });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: mongoose.Types.ObjectId(req.user._id) }).populate('organisation');
    if (!user) {
      throw new APIError(USER_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    return res.json({
      success: true, data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastSignin: user.lastSignin,
          emailVerified: user.emailVerified,
          organisation: user.organisation,
          organisationType: user.organisationType,
          picture: user.picture ? getSignedUrl(user.picture) : undefined
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: mongoose.Types.ObjectId(req.params.userId) }).populate('organisation');
    if (!user) {
      throw new APIError(USER_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    return res.json({
      success: true, data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastSignin: user.lastSignin,
          emailVerified: user.emailVerified,
          organisation: user.organisation,
          organisationType: user.organisationType,
          picture: user.picture ? getSignedUrl(user.picture) : undefined
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};



export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = await User.findOne({ _id: mongoose.Types.ObjectId(req.params.userId) });
    if (!user) {
      throw new APIError(USER_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    await user.update({ ...user.toObject(), ...req.body });
    return res.json({
      success: true,
      message: UPDATE_USER_SUCCESSFULL,
      data: {
        user: {
          ...user.toJSON(),
          picture: user.picture ? getSignedUrl(user.picture) : undefined
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ organisation: req.user.organisation });
    return res.json({
      success: true, data: {
        users: users.map((user) => {
          return {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            lastSignin: user.lastSignin,
            emailVerified: user.emailVerified,
            organisation: user.organisation,
            organisationType: user.organisationType
          }
        })
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};

export const userSignin = async ({ body }: { body: { email: string, password: string } }, res: Response, next: NextFunction) => {
  try {
    await userSigninSchema.validateAsync(body);
    const { email, password } = body;
    const user = await User.findOne({ email }).populate('organisation') as unknown as UserDocument & { organisation: OrganisationDocument };
    if (!user)
      throw new APIError(USER_NOT_FOUND, httpStatus.NOT_FOUND);
    if (!user.password) {
      throw new APIError(NO_PASSWORD, httpStatus.NOT_FOUND);
    }
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      throw new APIError(INVALID_PASSWORD, httpStatus.BAD_REQUEST)
    }
    user.lastSignin = new Date();
    await user.save();
    const { token, payload } = generateToken(user);
    return res.json({
      success: true,
      data: {
        token,
        user: {
          ...payload,
          organisation: {
            ...user.organisation.toJSON(),
            picture: user.organisation.picture ? getSignedUrl(user.organisation.picture) : undefined
          }
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}

export const verifyOTP = async ({ body }: { body: { email: string, otp: string } }, res: Response, next: NextFunction) => {
  try {
    await verifyOTPSchema.validateAsync(body);
    const { email, otp } = body;
    const user = await User.findOne({ email }).populate('organisation');
    if (!user)
      throw new APIError(USER_NOT_FOUND, httpStatus.NOT_FOUND);
    if (isExpired(user.otpExpiry))
      throw new APIError(OTP_EXPIRED, httpStatus.BAD_REQUEST);
    if (user && user.otp !== otp)
      throw new APIError(INVALID_OTP, httpStatus.BAD_REQUEST);
    const { token, payload } = generateToken(user);
    user.lastSignin = dayjs().toDate();
    user.emailVerified = true;
    await user.save();
    return res.json({
      success: true,
      data: {
        token,
        user: { ...payload, organisation: user.organisation }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}

export const userSetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await setPasswordSchema.validateAsync(req.body);
    const user = await User.findById(mongoose.Types.ObjectId(req.user._id));
    if (!user)
      throw new APIError(USER_NOT_FOUND, httpStatus.NOT_FOUND);
    user.password = req.body.password;
    await user.save();
    return res.json({
      success: true,
      message: SET_PASSWORD_SUCCESSFULL
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}
