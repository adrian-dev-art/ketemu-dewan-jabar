import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
});

// Request interceptor: tambahkan token JWT ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
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
      SecureStore.deleteItemAsync('auth_token');
      SecureStore.deleteItemAsync('auth_user');
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
