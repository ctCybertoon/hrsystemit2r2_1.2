const axios = require('axios');

/**
 * Pre-configured Axios instance that points to the Laravel HR backend.
 * All middleware services use this to communicate with System 1 (HRMS).
 */
const laravelClient = axios.create({
  baseURL: process.env.LARAVEL_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 10000,
});

/**
 * Attach the Bearer token from the incoming request to every outgoing
 * Laravel request so Sanctum authentication is forwarded transparently.
 */
laravelClient.interceptors.request.use((config) => {
  if (config.forwardToken) {
    config.headers['Authorization'] = `Bearer ${config.forwardToken}`;
    delete config.forwardToken;
  }
  return config;
});

module.exports = laravelClient;
