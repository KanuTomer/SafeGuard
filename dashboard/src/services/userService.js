import apiClient from './apiClient';

export const getUserProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data.user;
};

export const createContact = async (payload) => {
  const response = await apiClient.post('/api/users/me/contacts', payload);
  return response.data.data.contact;
};

export const updateUserProfile = async (payload) => {
  const response = await apiClient.patch('/api/users/me', payload);
  return response.data.data.user;
};

export const updateContact = async (contactId, payload) => {
  const response = await apiClient.patch(`/api/users/me/contacts/${contactId}`, payload);
  return response.data.data.contact;
};

export const deleteContact = async (contactId) => {
  await apiClient.delete(`/api/users/me/contacts/${contactId}`);
};
