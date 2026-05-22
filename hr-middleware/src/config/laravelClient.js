const axios = require('axios');


const laravelClient = axios.create({
  baseURL: process.env.LARAVEL_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 10000,
});


laravelClient.interceptors.request.use((config) => {
  if (config.forwardToken) {
    config.headers['Authorization'] = `Bearer ${config.forwardToken}`;
    delete config.forwardToken;
  }
  return config;
});

module.exports = laravelClient;
