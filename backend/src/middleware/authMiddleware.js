const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');

const createUnauthorizedError = (message) => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createUnauthorizedError('Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || env.jwtSecret;
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(createUnauthorizedError('User for this token no longer exists'));
    }

    req.user = user;
    return next();
  } catch {
    return next(createUnauthorizedError('Invalid or expired authentication token'));
  }
};

module.exports = {
  protect,
};
