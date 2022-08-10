import { Express } from "express";
import {
  addUser,
  getUser,
  getUsers,
  me,
  updateUser,
  userSetPassword,
  userSignin,
  userSignup,
  verifyOTP,
} from "../controllers/user-controller";

export = (app: Express) => {
  app.route('/api/auth/signup')
    .post(userSignup);
  app.route('/api/user')
    .get(getUsers)
    .post(addUser);
  app.route('/api/user/:userId')
    .get(getUser)
    .put(updateUser);
  app.route('/api/me')
    .get(me);
  app.route('/api/auth/signin')
    .post(userSignin);
  app.route('/api/auth/password')
    .post(userSetPassword);
  app.route('/api/auth/otp')
    .post(verifyOTP);
}