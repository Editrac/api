import { Request, Response, NextFunction } from "express";
import mongoose, { FilterQuery } from 'mongoose';
import dayjs from 'dayjs';
import httpStatus from 'http-status';
import logger from '../../../winston';
import {
  ORGANISATION_CREATE_SUCCESS,
  ORGANISATION_EXISTS,
  ORGANISATION_NOT_FOUND,
  UPDATE_ORGANISATION_SUCCESSFUL,
} from '../../../const/user/organisation-message-const';
import APIError from '../../../error';
import User from '../models/user-model';
import {
  PROJECT_TEMPLATE_CREATE_SUCCESS,
  PROJECT_TEMPLATE_NOT_FOUND,
  PROJECT_TEMPLATE_UPDATE_SUCCESS,
} from '../../../const/user/organisation-message-const';
import { Organisation } from '../models/organisation-model';
import { ProjectTemplate } from '../models/project-template-model';
import { createOrganisationSchema, updateOrganisationSchema, createUpdateProjectTemplateSchema } from '../validators/organisation-validator';
import { generateOtp } from '../../../utils/otp';
import { OrganisationType } from '../@types/organisation-type';
import { EmailQ, EmailQType } from '../../../mqs/email/email-mq';
import { getSignedUrl } from '../../../utils/cf-util';

export const createOrganisation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createOrganisationSchema.validateAsync(req.body);
    const { organisationName, userEmail, userFirstName, userLastName } = req.body;
    const organisation = await Organisation.findOne({ name: organisationName });
    if (organisation)
      throw new APIError(ORGANISATION_EXISTS, httpStatus.CONFLICT);
    const newUser = new User({
      email: userEmail,
      firstName: userFirstName,
      lastName: userLastName
    });
    const newOrganisation = new Organisation({ name: organisationName });
    newUser.organisation = newOrganisation._id;
    newUser.otp = generateOtp();
    newUser.otpExpiry = dayjs().add(5, 'days').toISOString();
    newUser.organisationType = OrganisationType.PRODUCING;
    newOrganisation.organisationType = OrganisationType.PRODUCING;
    newOrganisation.editingOrgs.push(req.user.organisation);
    const session = await mongoose.startSession();
    session.startTransaction();
    await newUser.save();
    await newOrganisation.save();
    await Organisation.findByIdAndUpdate(mongoose.Types.ObjectId(req.user.organisation), { $push: { producingOrgs: newOrganisation._id } });
    await session.commitTransaction();
    session.endSession();
    try {
      await EmailQ.add({ type: EmailQType.SEND_OTP, email: newUser.email, otp: newUser.otp })
    } catch (error) {
      logger.error(error.message);
    }
    return res.json({
      success: true,
      data: {
        organisation: newOrganisation
      },
      message: ORGANISATION_CREATE_SUCCESS
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}

export const getOrganisations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationType } = req.user;
    const localField = organisationType === OrganisationType.PRODUCING ? "editingOrgs" : "producingOrgs"
    const organisation = await Organisation.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.user.organisation)
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
    const organisations = organisation.length ? organisation[0].organisations : []
    return res.json({
      success: true, data: {
        organisations: organisations.map((org: any, index: number) => {
          return {
            ...org,
            picture: org.picture ? getSignedUrl(org.picture) : undefined
          }
        })
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}

export const updateOrganisation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId } = req.params;
    await updateOrganisationSchema.validateAsync(req.body);
    let organisation = await Organisation.findById(organisationId);
    if (!organisation) {
      throw new APIError(ORGANISATION_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    organisation.name = req.body.organisationName;
    if (req.body.picture) {
      organisation.picture = req.body.picture;
    }
    await organisation.save();
    return res.json({
      success: true,
      message: UPDATE_ORGANISATION_SUCCESSFUL,
      data: {
        organisation: {
          ...organisation.toJSON(),
          picture: organisation.picture ? getSignedUrl(organisation.picture) : undefined
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}

export const createProjectTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createUpdateProjectTemplateSchema.validateAsync(req.body);
    const { organisationId } = req.params;
    const newProjectTemplate = await _createProjectTemplate(organisationId, req.body);
    return res.json({
      success: true,
      data: {
        projectTemplate: newProjectTemplate
      },
      message: PROJECT_TEMPLATE_CREATE_SUCCESS
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
}

export const _createProjectTemplate = async (organisationId: string, body: object) => {
  try {
    const organisation = await Organisation.findById(mongoose.Types.ObjectId(organisationId));
    if (!organisation)
      throw new APIError(ORGANISATION_NOT_FOUND, httpStatus.NOT_FOUND);
    const newProjectTemplate = new ProjectTemplate({
      ...body,
      organisation: organisationId
    });
    return await newProjectTemplate.save();
  } catch (error) {
    throw error;
  }
}


export const getProjectTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organisationId } = req.params;
    const { organisationType, organisation: userOrg } = req.user;
    const editingOrg = organisationType === OrganisationType.EDITING ? userOrg : organisationId
    const projectTemplates = await ProjectTemplate.find({ organisation: mongoose.Types.ObjectId(editingOrg) });
    return res.json({
      success: true,
      data: {
        projectTemplates
      }
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};


export const updateProjectTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pTemplateId } = req.params;
    await createUpdateProjectTemplateSchema.validateAsync(req.body);
    let projectTemplate = await ProjectTemplate.findById(pTemplateId);
    if (!projectTemplate) {
      throw new APIError(PROJECT_TEMPLATE_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    await projectTemplate.update({ ...projectTemplate.toObject(), ...req.body })
    return res.json({
      success: true,
      data: {
        projectTemplate: projectTemplate.toJSON()
      },
      message: PROJECT_TEMPLATE_UPDATE_SUCCESS
    });
  } catch (error) {
    logger.error(error.message);
    return next(error);
  }
};
