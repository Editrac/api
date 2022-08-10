"use strict";
const user_controller_1 = require("../controllers/user-controller");
module.exports = (app) => {
    app.route('/api/auth/signup')
        .post(user_controller_1.userSignup);
    app.route('/api/user')
        .get(user_controller_1.getUsers)
        .post(user_controller_1.addUser);
    app.route('/api/user/:userId')
        .get(user_controller_1.getUser)
        .put(user_controller_1.updateUser);
    app.route('/api/me')
        .get(user_controller_1.me);
    app.route('/api/auth/signin')
        .post(user_controller_1.userSignin);
    app.route('/api/auth/password')
        .post(user_controller_1.userSetPassword);
    app.route('/api/auth/otp')
        .post(user_controller_1.verifyOTP);
};
