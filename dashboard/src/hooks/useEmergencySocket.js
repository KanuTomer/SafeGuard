import { useEffect, useState } from 'react';

import { createEmergencySocket } from '../services/socketService';
import { useAuth } from './useAuth';

export const useEmergencySocket = (emergencyId, onLocationCreated) => {
  const { token } = useAuth();
  const [socketError, setSocketError] = useState('');

  useEffect(() => {
    if (!token || !emergencyId) {
      return undefined;
    }

    const socket = createEmergencySocket(token);

    socket.on('connect', () => {
      socket.emit('emergency:join', { emergencyId });
    });

    socket.on('emergency:joined', () => {
      setSocketError('');
    });

    socket.on('location:created', ({ location }) => {
      onLocationCreated(location);
    });

    socket.on('socket:error', (payload) => {
      setSocketError(payload?.message || 'Realtime connection error');
    });

    socket.on('connect_error', (error) => {
      setSocketError(error.message || 'Unable to connect to realtime updates');
    });

    return () => {
      socket.emit('emergency:leave', { emergencyId });
      socket.disconnect();
    };
  }, [emergencyId, onLocationCreated, token]);

  return { socketError };
};
