const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('../helpers/redis_helper');
// middleware to protect routes with access token technique
const verifyAccessToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return next(createError.Unauthorized('Unauthorized: Please pass a valid Bearer Authorization token'));
  try {
    const splittedToken = token.split('Bearer ')[1];
    jwt.verify(splittedToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return next(
            createError.Unauthorized(
              'Token is expired please use /refresh-token route for getting a new pair of refresh and access tokens.'
            )
          );
        } else {
          return next(createError.Unauthorized());
        }
      }
      req.user = payload.aud;
      next();
    });
  } catch (err) {
    return next(createError.Unauthorized('Unauthorized: Please pass token in true bearer format'));
  }
};
const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return reject(createError.Unauthorized('Refresh-Token is expired, please login to get new pair of tokens.'));
        } else {
          return reject(createError.Unauthorized('Please login to get new pair of tokens'));
        }
      }
      const userID = payload.aud;
      client.GET(userID, (err, value) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }

        if (value === refreshToken) return resolve(userID);
        reject(createError.Unauthorized());
      });
    });
  });
};
module.exports = { verifyAccessToken, verifyRefreshToken };
