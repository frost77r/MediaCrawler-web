import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Response interceptor for error handling
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Unknown error';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default request;
