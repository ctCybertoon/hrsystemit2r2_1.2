import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Point this to your middleware ──────────────────────────────────────────
// If testing on a physical device, replace localhost with your PC's local IP
// e.g. http://192.168.1.10:4000/api
const BASE_URL = 'http://192.168.254.111:4000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 10000,
});

// Attach token automatically to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
