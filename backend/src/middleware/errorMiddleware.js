const { sendError } = require('../utils/apiResponse');

const errorMiddleware = (err, req, res, next) => {
  void next;

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  return sendError(res, statusCode, message);
};

module.exports = errorMiddleware;
