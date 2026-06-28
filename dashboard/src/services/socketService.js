import { io } from 'socket.io-client';

export const createEmergencySocket = (token) => {
  return io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    autoConnect: true,
  });
};
