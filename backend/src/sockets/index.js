const { Server } = require('socket.io');

const env = require('../config/env');
const { registerEmergencySocketHandlers } = require('./emergencySocket');
const { authenticateSocket } = require('./socketAuth');

const initializeSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    registerEmergencySocketHandlers(socket);
  });

  app.set('io', io);
  return io;
};

module.exports = {
  initializeSocket,
};
