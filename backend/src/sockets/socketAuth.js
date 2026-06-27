const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');

const createSocketError = (message) => {
  const error = new Error(message);
  error.data = { message };
  return error;
};

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(createSocketError('Authentication token is required'));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || env.jwtSecret;
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(createSocketError('User for this token no longer exists'));
    }

    socket.user = user;
    return next();
  } catch {
    return next(createSocketError('Invalid or expired authentication token'));
  }
};

module.exports = {
  authenticateSocket,
};
