const mongoose = require('mongoose');

const EmergencySession = require('../models/EmergencySession');

const buildEmergencyRoom = (emergencyId) => `emergency:${emergencyId}`;

const emitSocketError = (socket, message) => {
  socket.emit('socket:error', { message });
};

const findOwnedEmergencySession = async (userId, emergencyId) => {
  if (!mongoose.Types.ObjectId.isValid(emergencyId)) {
    return null;
  }

  return EmergencySession.findOne({
    _id: emergencyId,
    user: userId,
  });
};

const registerEmergencySocketHandlers = (socket) => {
  socket.on('emergency:join', async (payload = {}) => {
    const emergencyId = payload.emergencyId;

    if (!mongoose.Types.ObjectId.isValid(emergencyId)) {
      emitSocketError(socket, 'Emergency session id must be valid');
      return;
    }

    const emergency = await findOwnedEmergencySession(socket.user._id, emergencyId);

    if (!emergency) {
      emitSocketError(socket, 'Emergency session not found');
      return;
    }

    const room = buildEmergencyRoom(emergencyId);
    await socket.join(room);
    socket.emit('emergency:joined', { emergencyId, room });
  });

  socket.on('emergency:leave', async (payload = {}) => {
    const emergencyId = payload.emergencyId;

    if (!mongoose.Types.ObjectId.isValid(emergencyId)) {
      emitSocketError(socket, 'Emergency session id must be valid');
      return;
    }

    const room = buildEmergencyRoom(emergencyId);
    await socket.leave(room);
    socket.emit('emergency:left', { emergencyId, room });
  });
};

module.exports = {
  buildEmergencyRoom,
  registerEmergencySocketHandlers,
};
