const { sendError } = require('../utils/apiResponse');

const validateEvidenceMetadata = (req, res, next) => {
  const body = req.body || {};
  const { notes } = body;
  const errors = [];

  if (!req.file) {
    errors.push('Evidence file is required');
  }

  if (notes !== undefined) {
    if (typeof notes !== 'string') {
      errors.push('Notes must be a string');
    } else if (notes.trim().length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = {
    ...(notes !== undefined && { notes }),
  };

  return next();
};

module.exports = {
  validateEvidenceMetadata,
};
