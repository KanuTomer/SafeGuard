const { sendError } = require('../utils/apiResponse');

const emailPattern = /^\S+@\S+\.\S+$/;

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !emailPattern.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !emailPattern.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
