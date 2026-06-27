const {
  createEmergencySession,
  endEmergencySession,
  getActiveEmergencySession,
  getEmergencySessionById,
  listEmergencySessions,
} = require('../services/emergencyService');
const { sendSuccess } = require('../utils/apiResponse');

const createEmergency = async (req, res, next) => {
  try {
    const emergency = await createEmergencySession(req.user, req.body);
    return sendSuccess(res, 201, 'Emergency session created successfully', { emergency });
  } catch (error) {
    return next(error);
  }
};

const getActiveEmergency = async (req, res, next) => {
  try {
    const emergency = await getActiveEmergencySession(req.user._id);
    return sendSuccess(res, 200, 'Active emergency session retrieved successfully', {
      emergency,
    });
  } catch (error) {
    return next(error);
  }
};

const listEmergencies = async (req, res, next) => {
  try {
    const emergencies = await listEmergencySessions(req.user._id);
    return sendSuccess(res, 200, 'Emergency sessions retrieved successfully', {
      emergencies,
    });
  } catch (error) {
    return next(error);
  }
};

const getEmergency = async (req, res, next) => {
  try {
    const emergency = await getEmergencySessionById(req.user._id, req.params.emergencyId);
    return sendSuccess(res, 200, 'Emergency session retrieved successfully', { emergency });
  } catch (error) {
    return next(error);
  }
};

const endEmergency = async (req, res, next) => {
  try {
    const emergency = await endEmergencySession(req.user._id, req.params.emergencyId);
    return sendSuccess(res, 200, 'Emergency session ended successfully', { emergency });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createEmergency,
  endEmergency,
  getActiveEmergency,
  getEmergency,
  listEmergencies,
};
