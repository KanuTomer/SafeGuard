import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage } from '../services/apiClient';
import { getActiveEmergency, listEmergencies } from '../services/emergencyService';
import { getUserProfile } from '../services/userService';

export const useDashboardData = () => {
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [active, sessions, userProfile] = await Promise.all([
        getActiveEmergency(),
        listEmergencies(),
        getUserProfile(),
      ]);

      setActiveEmergency(active);
      setEmergencies(sessions);
      setError('');
      setProfile(userProfile);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialDashboardData = async () => {
      try {
        setIsLoading(true);
        const [active, sessions, userProfile] = await Promise.all([
          getActiveEmergency(),
          listEmergencies(),
          getUserProfile(),
        ]);

        if (!isMounted) {
          return;
        }

        setActiveEmergency(active);
        setEmergencies(sessions);
        setError('');
        setProfile(userProfile);
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load dashboard data'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { activeEmergency, emergencies, error, isLoading, profile, reload: loadDashboardData };
};
