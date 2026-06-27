const { sendSuccess } = require('../utils/apiResponse');

const getHealthStatus = async (req, res) => {
  return sendSuccess(res, 200, 'SafeGuard API is healthy', {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};
