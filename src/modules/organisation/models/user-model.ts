import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { IUser } from '../@types/user-type';
import { UserRole } from '../@types/user-enum';
import { OrganisationType } from '../@types/organisation-type';

export type UserDocument = mongoose.Document & IUser & {
  comparePassword: comparePassword;
};

type comparePassword = (password: string) => Promise<boolean>;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  otp: String,
  otpExpiry: Date,
  lastSignin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  password: String,
  picture: String,
  organisation: {
    type: mongoose.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  organisationType: {
    type: String,
    default: OrganisationType.EDITING,
    enum: Object.values(OrganisationType)
  },
  role: {
    type: String,
    default: UserRole.ADMIN,
    enum: Object.values(UserRole)
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err: mongoose.Error, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      return next();
    });
  });
});

const comparePassword: comparePassword = function (password) {
  const user = this as UserDocument;
  return bcrypt.compare(password, user.password);
};

userSchema.methods.comparePassword = comparePassword;

userSchema.index({ email: 1, organisation: 1 }, { unique: true });

export const User = mongoose.model<UserDocument>("User", userSchema);
export default User;