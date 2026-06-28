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

export const createEmergency = async (initialLocation) => {
  const response = await apiClient.post('/api/emergencies', {
    ...(initialLocation && { initialLocation }),
  });
  return response.data.data.emergency;
};

export const endEmergency = async (emergencyId) => {
  const response = await apiClient.patch(`/api/emergencies/${emergencyId}/end`);
  return response.data.data.emergency;
};

export const createLocation = async (emergencyId, payload) => {
  const response = await apiClient.post(`/api/emergencies/${emergencyId}/locations`, payload);
  return response.data.data.location;
};

export const uploadEvidence = async (emergencyId, { file, notes }) => {
  const formData = new FormData();
  formData.append('file', file);

  if (notes) {
    formData.append('notes', notes);
  }

  const response = await apiClient.post(`/api/emergencies/${emergencyId}/evidence`, formData);
  return response.data.data.evidence;
};
