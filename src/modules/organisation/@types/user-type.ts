import { OrganisationType } from './organisation-type';
import { UserRole } from './user-enum';

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  password: string;
  otp: string;
  otpExpiry: string;
  emailVerified: boolean;
  role: UserRole;
  lastSignin: Date;
  organisation: string;
  organisationType: OrganisationType;
}