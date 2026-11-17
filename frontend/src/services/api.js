
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await axios({
      url: `${API_BASE_URL}${endpoint}`,
      ...options,
      headers,
    });

    return response.data;

  }catch (error) {
  throw new Error(
    error.response?.data?.message || 'Something went wrong with the request',
    { cause: error }
  );
}
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', data: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', data: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
