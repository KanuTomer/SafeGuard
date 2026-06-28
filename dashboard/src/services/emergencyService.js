import apiClient from './apiClient';

export const getActiveEmergency = async () => {
  const response = await apiClient.get('/api/emergencies/active');
  return response.data.data.emergency;
};

export const listEmergencies = async () => {
  const response = await apiClient.get('/api/emergencies');
  return response.data.data.emergencies;
};

export const getEmergency = async (emergencyId) => {
  const response = await apiClient.get(`/api/emergencies/${emergencyId}`);
  return response.data.data.emergency;
};

export const listLocations = async (emergencyId) => {
  const response = await apiClient.get(`/api/emergencies/${emergencyId}/locations`);
  return response.data.data.locations;
};

export const listEvidence = async (emergencyId) => {
  const response = await apiClient.get(`/api/emergencies/${emergencyId}/evidence`);
  return response.data.data.evidence;
};
