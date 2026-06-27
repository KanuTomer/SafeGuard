const { sendError } = require('../utils/apiResponse');

const notFoundMiddleware = (req, res) => {
  return sendError(res, 404, `Route not found: ${req.originalUrl}`);
};

module.exports = notFoundMiddleware;
