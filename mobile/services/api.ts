import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LOCAL_URL = Platform.OS === 'web' ? 'http://localhost:5001' : 'http://111.111.111.171:5001';
const PROD_URL = 'https://ketemudewan.perdinkeuangan.online';
const PROD_API_KEY = '23985e35b6e9f9445c448b8eb8868edbc7fb5e5822d0c53d1ddff079f88e3ab1';

// Default to production or env var if available
let currentBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || PROD_URL;
let currentApiKey = process.env.EXPO_PUBLIC_API_KEY || PROD_API_KEY;

const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(currentApiKey ? { 'x-api-key': currentApiKey } : {}),
  },
});

export const setEnvironment = (env: 'local' | 'production') => {
  if (env === 'local') {
    currentBaseUrl = LOCAL_URL;
    currentApiKey = ''; // Local doesn't enforce API key by default
  } else {
    currentBaseUrl = PROD_URL;
    currentApiKey = PROD_API_KEY;
  }
  
  api.defaults.baseURL = currentBaseUrl;
  if (currentApiKey) {
    api.defaults.headers.common['x-api-key'] = currentApiKey;
  } else {
    delete api.defaults.headers.common['x-api-key'];
  }
  
  console.log(`[API] Switched to ${env} environment:`, currentBaseUrl);
};

import { Platform } from 'react-native';

const getStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch (e) {}
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// Request interceptor: tambahkan token JWT ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await getStorageItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: tangani error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token tidak valid atau expired — bersihkan storage
      deleteStorageItemAsync('auth_token');
      deleteStorageItemAsync('auth_user');
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ──────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    instansi?: string;
    noKtp?: string;
  }) => api.post('/api/auth/register', data),
};

// ── Users / Dewan Endpoints ─────────────────────────────────
export const usersApi = {
  getDewan: () => api.get('/api/users/dewan'),
  getDewanById: (id: number) => api.get(`/api/users/dewan/${id}`),
  getProfile: () => api.get('/api/users/profile'),
};

// ── Schedule Endpoints ──────────────────────────────────────
export const schedulesApi = {
  getMySchedules: () => api.get('/api/schedules'),
  create: (data: { title: string; start_time: string; dewan_ids: number[] }) =>
    api.post('/api/schedules', data),
  updateStatus: (scheduleId: number, dewanId: number, status: 'confirmed' | 'rejected') =>
    api.patch(`/api/schedules/${scheduleId}`, { status, dewan_id: dewanId }),
  delete: (id: number) => api.delete(`/api/schedules/${id}`),
};

// ── Availability Endpoints ──────────────────────────────────
export const availabilityApi = {
  getDewanAvailability: (dewanId: number) =>
    api.get(`/api/availability/${dewanId}`),
  create: (data: { startTime: string; endTime: string }) =>
    api.post('/api/availability', data),
  delete: (id: number) => api.delete(`/api/availability/${id}`),
};

// ── LiveKit Token Endpoint ──────────────────────────────────
export const livekitApi = {
  getToken: (roomName: string, scheduleId?: number) =>
    api.post('/api/livekit/token', { roomName, scheduleId }),
};

// ── Ratings Endpoint ────────────────────────────────────────
export const ratingsApi = {
  submit: (data: {
    scheduleId: number;
    dewanId: number;
    speakingScore: number;
    contextScore: number;
    timeScore: number;
    responsivenessScore: number;
    solutionScore: number;
    comment?: string;
  }) => api.post('/api/ratings', {
    schedule_id: data.scheduleId,
    dewan_id: data.dewanId,
    speaking_score: data.speakingScore,
    context_score: data.contextScore,
    time_score: data.timeScore,
    responsiveness_score: data.responsivenessScore,
    solution_score: data.solutionScore,
    comment: data.comment
  }),
  getDewanRatings: (dewanId: number) => api.get(`/api/ratings/dewan/${dewanId}`),
};

export const adminApi = {
  getAllUsers: () => api.get('/api/admin/users'),
  getAllSchedules: () => api.get('/api/admin/schedules'),
  getAllRatings: () => api.get('/api/admin/ratings'),
};

export default api;
