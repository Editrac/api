import jsonwebtoken from 'jsonwebtoken';
import moment from 'moment';
import { UserDocument } from '../models/user-model';
import { config } from '../../../config';
import { OrganisationDocument } from '../models/organisation-model';

export const generateToken = (user: UserDocument) => {
  const organisation = user.organisation as unknown as OrganisationDocument;
  const payload = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    lastSignin: user.lastSignin,
    emailVerified: user.emailVerified,
    organisation: organisation._id,
    organisationType: user.organisationType
  };
  const token = jsonwebtoken.sign(payload, config.jwtSecret, {
    expiresIn: moment().endOf('D').add(5, 'day').unix() - moment().unix()
  });
  return { token, payload }
}