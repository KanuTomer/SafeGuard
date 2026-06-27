const { sendError } = require('../utils/apiResponse');

const emailPattern = /^\S+@\S+\.\S+$/;

const validateProfileUpdate = (req, res, next) => {
  const { name, phone } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (phone !== undefined && typeof phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = {
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone }),
  };

  return next();
};

const validateCreateContact = (req, res, next) => {
  const { name, phone, email, relationship } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Contact name must be at least 2 characters');
  }

  if (!phone && !email) {
    errors.push('Contact phone or email is required');
  }

  if (email && !emailPattern.test(email)) {
    errors.push('Contact email must be valid');
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = {
    name,
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
    ...(relationship !== undefined && { relationship }),
  };

  return next();
};

const validateUpdateContact = (req, res, next) => {
  const { name, phone, email, relationship } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length < 2) {
    errors.push('Contact name must be at least 2 characters');
  }

  if (email !== undefined && email && !emailPattern.test(email)) {
    errors.push('Contact email must be valid');
  }

  if (phone !== undefined && phone === '' && !email) {
    errors.push('Contact phone or email is required');
  }

  if (email !== undefined && email === '' && !phone) {
    errors.push('Contact phone or email is required');
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = {
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
    ...(relationship !== undefined && { relationship }),
  };

  return next();
};

module.exports = {
  validateCreateContact,
  validateProfileUpdate,
  validateUpdateContact,
};
