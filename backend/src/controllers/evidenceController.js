const { createEvidence, listEvidence } = require('../services/evidenceService');
const { sendSuccess } = require('../utils/apiResponse');

const uploadEvidence = async (req, res, next) => {
  try {
    const evidence = await createEvidence(req.user._id, req.params.emergencyId, req.file, req.body);
    return sendSuccess(res, 201, 'Evidence uploaded successfully', { evidence });
  } catch (error) {
    return next(error);
  }
};

const getEvidence = async (req, res, next) => {
  try {
    const evidence = await listEvidence(req.user._id, req.params.emergencyId);
    return sendSuccess(res, 200, 'Evidence retrieved successfully', { evidence });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getEvidence,
  uploadEvidence,
};
