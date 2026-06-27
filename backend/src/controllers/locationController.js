const { createLocationPoint, listLocationPoints } = require('../services/locationService');
const { sendSuccess } = require('../utils/apiResponse');

const createLocation = async (req, res, next) => {
  try {
    const location = await createLocationPoint(req.user._id, req.params.emergencyId, req.body);
    return sendSuccess(res, 201, 'Location point created successfully', { location });
  } catch (error) {
    return next(error);
  }
};

const listLocations = async (req, res, next) => {
  try {
    const locations = await listLocationPoints(req.user._id, req.params.emergencyId);
    return sendSuccess(res, 200, 'Location history retrieved successfully', { locations });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createLocation,
  listLocations,
};
