import axios from 'axios';

import { API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let unauthorizedHandler = null;

export const setAuthToken = token => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

export const setUnauthorizedHandler = handler => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (
  error,
  fallback = 'Something went wrong. Please try again.',
) => {
  return error.response?.data?.message || error.message || fallback;
};

export default apiClient;
