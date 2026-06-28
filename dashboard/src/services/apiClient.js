import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const responseData = error.response?.data;
  const validationErrors = Array.isArray(responseData?.errors)
    ? responseData.errors.filter(Boolean)
    : [];

  if (validationErrors.length > 0) {
    return validationErrors.join(' ');
  }

  return responseData?.message || error.message || fallback;
};

export default apiClient;
