const User = require('../models/User.model');
const { loginValidation, registerValidation } = require('../helpers/joi_helper');
const bcrypt = require('bcryptjs');
const { getAccessTokens, getRefreshTokens } = require('../helpers/jwt_helper');
const { verifyRefreshToken } = require('../middlewares/verify_mw');
const createError = require('http-errors');
const client = require('../helpers/redis_helper');
module.exports = {
  register: async (req, res, _next) => {
    const { error } = registerValidation(req.body);
    if (error) {
      return res.status(422).json({
        error: true,
        errorType: error.details[0].type,
        errorMessage: error.details[0].message,
      });
    }
    const { email, username, password } = req.body;
    const isUserExists = await User.findOne({ email: email }).exec();
    if (isUserExists) {
      return res.status(422).json({
        error: true,
        errorType: 'NOT_UNIQUE_EMAIL',
        errorMessage: 'Please use another email different to register.',
      });
    }

    const createdUser = new User({
      email: email,
      username: username,
      password: password,
    });
    try {
      const savedUser = await createdUser.save();
      return res.status(200).json({
        error: false,
        id: savedUser.id,
        message: 'New user successfully registered',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: true,
        errorType: 'SAVE_USER_ERROR',
        errorMessage: err,
      });
    }
  },
  login: async (req, res, _next) => {
    const { error } = loginValidation(req.body);
    if (error) {
      return res.status(422).json({
        error: true,
        errorType: error.details[0].type,
        errorMessage: error.details[0].message,
      });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email: email }).exec();
    if (!user) {
      return res.status(422).json({
        error: true,
        errorType: 'EMAIL_DO_NOT_EXISTS',
        errorMessage: 'There is no user which has this email.',
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(422).json({
        error: true,
        errorType: 'WRONG_PASSWORD',
        errorMessage: 'Password is wrong.',
      });
    }
    const accessToken = await getAccessTokens(user.id);
    const refreshToken = await getRefreshTokens(user.id);
    return res.status(200).json({
      error: false,
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: 'Logged in successfully.',
    });
  },
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return createError.BadRequest();
      const userID = await verifyRefreshToken(refreshToken); // this method returns userID
      const accessToken = await getAccessTokens(userID);
      const newRefreshToken = await getRefreshTokens(userID);
      return res.status(200).json({
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createError.InternalServerError();
        }
        console.log(val);
        return res.status(204).json({
          error: false,
          message: 'Logout successfull',
        });
      });
    } catch (error) {
      next(error);
    }
  },
};
