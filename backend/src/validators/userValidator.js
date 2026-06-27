const { sendError } = require('../utils/apiResponse');

const emailPattern = /^\S+@\S+\.\S+$/;

const isProvided = (value) => value !== undefined;
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateProfileUpdate = (req, res, next) => {
  const { name, phone } = req.body;
  const errors = [];

  if (isProvided(name)) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
  }

  if (isProvided(phone) && typeof phone !== 'string') {
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
  const hasPhone = isNonEmptyString(phone);
  const hasEmail = isNonEmptyString(email);

  if (!isProvided(name)) {
    errors.push('Contact name is required');
  } else if (typeof name !== 'string') {
    errors.push('Contact name must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Contact name must be at least 2 characters');
  }

  if (isProvided(phone) && typeof phone !== 'string') {
    errors.push('Contact phone must be a string');
  }

  if (isProvided(email) && typeof email !== 'string') {
    errors.push('Contact email must be a string');
  }

  if (isProvided(relationship) && typeof relationship !== 'string') {
    errors.push('Contact relationship must be a string');
  }

  if (!hasPhone && !hasEmail) {
    errors.push('Contact phone or email is required');
  }

  if (hasEmail && !emailPattern.test(email)) {
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
  const hasPhone = isNonEmptyString(phone);
  const hasEmail = isNonEmptyString(email);

  if (isProvided(name)) {
    if (typeof name !== 'string') {
      errors.push('Contact name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Contact name must be at least 2 characters');
    }
  }

  if (isProvided(phone) && typeof phone !== 'string') {
    errors.push('Contact phone must be a string');
  }

  if (isProvided(email) && typeof email !== 'string') {
    errors.push('Contact email must be a string');
  }

  if (isProvided(relationship) && typeof relationship !== 'string') {
    errors.push('Contact relationship must be a string');
  }

  if (isProvided(phone) && isProvided(email) && !hasPhone && !hasEmail) {
    errors.push('Contact phone or email is required');
  }

  if (hasEmail && !emailPattern.test(email)) {
    errors.push('Contact email must be valid');
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
