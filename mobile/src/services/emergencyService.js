import apiClient from './apiClient';

export const getActiveEmergency = async () => {
  const response = await apiClient.get('/api/emergencies/active');
  return response.data.data.emergency;
};

export const createEmergency = async initialLocation => {
  const response = await apiClient.post('/api/emergencies', {
    ...(initialLocation && { initialLocation }),
  });
  return response.data.data.emergency;
};

export const endEmergency = async emergencyId => {
  const response = await apiClient.patch(`/api/emergencies/${emergencyId}/end`);
  return response.data.data.emergency;
};

export const createLocation = async (emergencyId, location) => {
  const response = await apiClient.post(
    `/api/emergencies/${emergencyId}/locations`,
    location,
  );
  return response.data.data.location;
};
