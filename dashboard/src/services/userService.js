import apiClient from './apiClient';

export const getUserProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data.user;
};

export const createContact = async (payload) => {
  const response = await apiClient.post('/api/users/me/contacts', payload);
  return response.data.data.contact;
};
