const EmergencySession = require('../models/EmergencySession');

const createEmergencyError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatLocation = (location) => {
  if (!location) {
    return null;
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy ?? null,
    timestamp: location.timestamp,
  };
};

const formatContactSnapshot = (contact) => ({
  name: contact.name || '',
  phone: contact.phone || '',
  email: contact.email || '',
  relationship: contact.relationship || '',
});

const formatEmergencySession = (session) => ({
  id: session._id.toString(),
  user: session.user.toString(),
  status: session.status,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
  initialLocation: formatLocation(session.initialLocation),
  lastKnownLocation: formatLocation(session.lastKnownLocation),
  contactsSnapshot: session.contactsSnapshot.map(formatContactSnapshot),
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

const buildLocation = (initialLocation) => {
  if (!initialLocation) {
    return null;
  }

  return {
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    ...(initialLocation.accuracy !== undefined && { accuracy: initialLocation.accuracy }),
    timestamp: initialLocation.timestamp ? new Date(initialLocation.timestamp) : new Date(),
  };
};

const buildContactsSnapshot = (user) => {
  return user.contacts.map((contact) => ({
    name: contact.name || '',
    phone: contact.phone || '',
    email: contact.email || '',
    relationship: contact.relationship || '',
  }));
};

const createEmergencySession = async (user, payload = {}) => {
  const activeSession = await EmergencySession.findOne({
    user: user._id,
    status: 'active',
  });

  if (activeSession) {
    throw createEmergencyError('An active emergency session already exists', 409);
  }

  const location = buildLocation(payload.initialLocation);
  let session;

  try {
    session = await EmergencySession.create({
      user: user._id,
      initialLocation: location,
      lastKnownLocation: location,
      contactsSnapshot: buildContactsSnapshot(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createEmergencyError('An active emergency session already exists', 409);
    }

    throw error;
  }

  return formatEmergencySession(session);
};

const getActiveEmergencySession = async (userId) => {
  const session = await EmergencySession.findOne({
    user: userId,
    status: 'active',
  }).sort({ startedAt: -1 });

  return session ? formatEmergencySession(session) : null;
};

const listEmergencySessions = async (userId) => {
  const sessions = await EmergencySession.find({ user: userId }).sort({ startedAt: -1 });

  return sessions.map(formatEmergencySession);
};

const getEmergencySessionById = async (userId, emergencyId) => {
  const session = await EmergencySession.findOne({
    _id: emergencyId,
    user: userId,
  });

  if (!session) {
    throw createEmergencyError('Emergency session not found', 404);
  }

  return formatEmergencySession(session);
};

const endEmergencySession = async (userId, emergencyId) => {
  const session = await EmergencySession.findOne({
    _id: emergencyId,
    user: userId,
  });

  if (!session) {
    throw createEmergencyError('Emergency session not found', 404);
  }

  if (session.status === 'ended') {
    throw createEmergencyError('Emergency session has already ended', 409);
  }

  session.status = 'ended';
  session.endedAt = new Date();

  await session.save();
  return formatEmergencySession(session);
};

module.exports = {
  createEmergencySession,
  endEmergencySession,
  formatEmergencySession,
  getActiveEmergencySession,
  getEmergencySessionById,
  listEmergencySessions,
};
