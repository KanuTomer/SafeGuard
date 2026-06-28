import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage } from '../services/apiClient';
import { getEmergency, listEvidence, listLocations } from '../services/emergencyService';

export const useEmergencyDetail = (emergencyId) => {
  const [emergency, setEmergency] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadEmergency = useCallback(async () => {
    try {
      setIsLoading(true);
      const [session, locationHistory, evidenceItems] = await Promise.all([
        getEmergency(emergencyId),
        listLocations(emergencyId),
        listEvidence(emergencyId),
      ]);

      setEmergency(session);
      setLocations(locationHistory);
      setEvidence(evidenceItems);
      setError('');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load emergency details'));
    } finally {
      setIsLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialEmergency = async () => {
      try {
        setIsLoading(true);
        const [session, locationHistory, evidenceItems] = await Promise.all([
          getEmergency(emergencyId),
          listLocations(emergencyId),
          listEvidence(emergencyId),
        ]);

        if (!isMounted) {
          return;
        }

        setEmergency(session);
        setLocations(locationHistory);
        setEvidence(evidenceItems);
        setError('');
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load emergency details'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialEmergency();

    return () => {
      isMounted = false;
    };
  }, [emergencyId]);

  const addRealtimeLocation = useCallback((location) => {
    setLocations((currentLocations) => {
      if (currentLocations.some((item) => item.id === location.id)) {
        return currentLocations;
      }

      return [...currentLocations, location].sort(
        (first, second) => new Date(first.recordedAt) - new Date(second.recordedAt)
      );
    });

    setEmergency((currentEmergency) => {
      if (!currentEmergency) {
        return currentEmergency;
      }

      const currentTimestamp = currentEmergency.lastKnownLocation?.timestamp;

      if (currentTimestamp && new Date(currentTimestamp) > new Date(location.recordedAt)) {
        return currentEmergency;
      }

      return {
        ...currentEmergency,
        lastKnownLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.recordedAt,
        },
      };
    });
  }, []);

  return {
    addRealtimeLocation,
    emergency,
    error,
    evidence,
    isLoading,
    locations,
    reload: loadEmergency,
  };
};
