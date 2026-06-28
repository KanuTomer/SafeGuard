import apiClient from './apiClient';

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data.data;
};

export const registerUser = async (payload) => {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data.data.user;
};
