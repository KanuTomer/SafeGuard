const mongoose = require('mongoose');

const { sendError } = require('../utils/apiResponse');

const isProvided = (value) => value !== undefined && value !== null;
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const validateInitialLocation = (req, res, next) => {
  const { initialLocation } = req.body;
  const errors = [];

  if (!isProvided(initialLocation)) {
    req.body = {};
    return next();
  }

  if (!isPlainObject(initialLocation)) {
    return sendError(res, 400, 'Validation failed', ['Initial location must be an object']);
  }

  const { latitude, longitude, accuracy, timestamp } = initialLocation;

  if (typeof latitude !== 'number') {
    errors.push('Latitude must be a number');
  } else if (latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (typeof longitude !== 'number') {
    errors.push('Longitude must be a number');
  } else if (longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (isProvided(accuracy)) {
    if (typeof accuracy !== 'number') {
      errors.push('Accuracy must be a number');
    } else if (accuracy < 0) {
      errors.push('Accuracy cannot be negative');
    }
  }

  if (isProvided(timestamp)) {
    if (typeof timestamp !== 'string' || Number.isNaN(Date.parse(timestamp))) {
      errors.push('Timestamp must be a valid date string');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = {
    initialLocation: {
      latitude,
      longitude,
      ...(accuracy !== undefined && { accuracy }),
      ...(timestamp !== undefined && { timestamp }),
    },
  };

  return next();
};

const validateEmergencyId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.emergencyId)) {
    return sendError(res, 400, 'Validation failed', ['Emergency session id must be valid']);
  }

  return next();
};

module.exports = {
  validateEmergencyId,
  validateInitialLocation,
};
