const { sendError } = require('../utils/apiResponse');

const isProvided = (value) => value !== undefined && value !== null;

const validateCreateLocation = (req, res, next) => {
  const { latitude, longitude, accuracy, recordedAt } = req.body;
  const errors = [];

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

  if (isProvided(recordedAt)) {
    if (typeof recordedAt !== 'string' || Number.isNaN(Date.parse(recordedAt))) {
      errors.push('Recorded at must be a valid date string');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = {
    latitude,
    longitude,
    ...(accuracy !== undefined && { accuracy }),
    ...(recordedAt !== undefined && { recordedAt }),
  };

  return next();
};

module.exports = {
  validateCreateLocation,
};
