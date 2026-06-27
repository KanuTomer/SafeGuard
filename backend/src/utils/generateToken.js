const jwt = require('jsonwebtoken');

const env = require('../config/env');

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || env.jwtSecret;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || env.jwtExpiresIn;

  if (!jwtSecret) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign({ userId: userId.toString() }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

module.exports = generateToken;
