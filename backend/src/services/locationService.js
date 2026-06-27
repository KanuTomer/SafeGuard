const EmergencySession = require('../models/EmergencySession');
const LocationPoint = require('../models/LocationPoint');

const createLocationError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatLocationPoint = (locationPoint) => ({
  id: locationPoint._id.toString(),
  user: locationPoint.user.toString(),
  emergencySession: locationPoint.emergencySession.toString(),
  latitude: locationPoint.latitude,
  longitude: locationPoint.longitude,
  accuracy: locationPoint.accuracy ?? null,
  recordedAt: locationPoint.recordedAt,
  createdAt: locationPoint.createdAt,
  updatedAt: locationPoint.updatedAt,
});

const findOwnedEmergencySession = async (userId, emergencyId) => {
  const emergency = await EmergencySession.findOne({
    _id: emergencyId,
    user: userId,
  });

  if (!emergency) {
    throw createLocationError('Emergency session not found', 404);
  }

  return emergency;
};

const buildLocationSnapshot = (locationPoint) => ({
  latitude: locationPoint.latitude,
  longitude: locationPoint.longitude,
  ...(locationPoint.accuracy !== undefined && { accuracy: locationPoint.accuracy }),
  timestamp: locationPoint.recordedAt,
});

const createLocationPoint = async (userId, emergencyId, payload) => {
  const emergency = await findOwnedEmergencySession(userId, emergencyId);

  if (emergency.status !== 'active') {
    throw createLocationError('Cannot add location to an ended emergency session', 409);
  }

  const locationPoint = await LocationPoint.create({
    user: userId,
    emergencySession: emergency._id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    ...(payload.accuracy !== undefined && { accuracy: payload.accuracy }),
    recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : new Date(),
  });

  emergency.lastKnownLocation = buildLocationSnapshot(locationPoint);
  await emergency.save();

  return formatLocationPoint(locationPoint);
};

const listLocationPoints = async (userId, emergencyId) => {
  await findOwnedEmergencySession(userId, emergencyId);

  const locationPoints = await LocationPoint.find({
    user: userId,
    emergencySession: emergencyId,
  }).sort({ recordedAt: 1 });

  return locationPoints.map(formatLocationPoint);
};

module.exports = {
  createLocationPoint,
  listLocationPoints,
};
