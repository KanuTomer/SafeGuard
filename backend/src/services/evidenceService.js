const EmergencySession = require('../models/EmergencySession');
const Evidence = require('../models/Evidence');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');

const createEvidenceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getEvidenceType = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  return null;
};

const isValidCloudinaryResult = (uploadResult) => {
  return Boolean(uploadResult?.public_id && uploadResult?.url && uploadResult?.secure_url);
};

const formatEvidence = (evidence) => ({
  id: evidence._id.toString(),
  user: evidence.user.toString(),
  emergencySession: evidence.emergencySession.toString(),
  type: evidence.type,
  originalName: evidence.originalName,
  mimeType: evidence.mimeType,
  size: evidence.size,
  cloudinaryPublicId: evidence.cloudinaryPublicId,
  url: evidence.url,
  secureUrl: evidence.secureUrl,
  notes: evidence.notes || '',
  createdAt: evidence.createdAt,
  updatedAt: evidence.updatedAt,
});

const findOwnedEmergencySession = async (userId, emergencyId) => {
  const emergency = await EmergencySession.findOne({
    _id: emergencyId,
    user: userId,
  });

  if (!emergency) {
    throw createEvidenceError('Emergency session not found', 404);
  }

  return emergency;
};

const createEvidence = async (userId, emergencyId, file, metadata = {}) => {
  if (!file) {
    throw createEvidenceError('Evidence file is required', 400);
  }

  const evidenceType = getEvidenceType(file.mimetype);

  if (!evidenceType) {
    throw createEvidenceError('Invalid file type', 400);
  }

  const emergency = await findOwnedEmergencySession(userId, emergencyId);

  if (emergency.status !== 'active') {
    throw createEvidenceError('Cannot upload evidence to an ended emergency session', 409);
  }

  let uploadResult;

  try {
    uploadResult = await uploadBufferToCloudinary(file, {
      resourceType: evidenceType === 'image' ? 'image' : 'video',
    });
  } catch {
    throw createEvidenceError('Evidence upload failed', 502);
  }

  if (!isValidCloudinaryResult(uploadResult)) {
    throw createEvidenceError('Evidence upload failed', 502);
  }

  const evidence = await Evidence.create({
    user: userId,
    emergencySession: emergency._id,
    type: evidenceType,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    cloudinaryPublicId: uploadResult.public_id,
    url: uploadResult.url,
    secureUrl: uploadResult.secure_url,
    notes: metadata.notes ? metadata.notes.trim() : '',
  });

  return formatEvidence(evidence);
};

const listEvidence = async (userId, emergencyId) => {
  await findOwnedEmergencySession(userId, emergencyId);

  const evidence = await Evidence.find({
    user: userId,
    emergencySession: emergencyId,
  }).sort({ createdAt: -1 });

  return evidence.map(formatEvidence);
};

module.exports = {
  createEvidence,
  listEvidence,
};
