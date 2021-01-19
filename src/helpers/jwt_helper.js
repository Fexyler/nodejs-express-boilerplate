const JWT = require('jsonwebtoken');
require('dotenv').config();
const client = require('./redis_helper');
const createError = require('http-errors');
const getAccessTokens = (userID) => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: userID,
    };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      issuer: process.env.DOMAIN,
      expiresIn: '30m',
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const getRefreshTokens = (userID) => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: userID,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      issuer: process.env.DOMAIN,
      expiresIn: '60d',
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      client.SET(userID, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  });
};

module.exports = { getAccessTokens, getRefreshTokens };
