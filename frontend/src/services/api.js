import axios from 'axios';
import { notifyToast } from './toastBus';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Strip trailing slashes and any accidental /api/v1 suffix so baseURL is always clean
const CLEAN_API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');

export const apiClient = axios.create({
  baseURL: `${CLEAN_API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Normalises every failure into the same `{ success, message, error }` envelope
 * the backend already returns, so callers can rely on `err.message` uniformly.
 */
function normaliseError(error) {
  // Connectivity failures (server down, CORS, timeout, offline).
  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED';
    const message = isTimeout
      ? 'The request timed out. Please try again.'
      : 'Unable to reach the server. Please check your connection and try again.';
    return {
      success: false,
      message,
      error: { code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR', details: error.message },
      status: 0,
    };
  }

  const data = error.response.data;
  if (data && typeof data === 'object' && 'message' in data) {
    return { ...data, status: error.response.status };
  }

  return {
    success: false,
    message: `Request failed with status ${error.response.status}.`,
    error: { code: `HTTP_${error.response.status}`, details: null },
    status: error.response.status,
  };
}

apiClient.interceptors.request.use((config) => {
  try {
    const token = sessionStorage.getItem('resume_studio_access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore sessionStorage access failures
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalised = normaliseError(error);

    // Only surface connectivity problems globally — validation errors (4xx) are
    // rendered inline by each page and would otherwise be duplicated.
    if (!error.response) {
      notifyToast({ message: normalised.message, type: 'error' });
    }

    return Promise.reject(normalised);
  }
);
