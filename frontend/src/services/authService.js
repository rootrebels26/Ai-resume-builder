import { apiClient } from './api';

export const AUTH_TOKEN_KEY = 'resume_studio_access_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    // LocalStorage might be disabled or full
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {
    // Ignore error
  }
}

/**
 * Verify unique company access code with the secure backend.
 * The access code is stored and evaluated SOLELY on the backend server.
 */
export async function verifyCompanyAccessCode(code) {
  return await apiClient.post('/auth/verify-code', { code });
}

/**
 * Validate existing session token with the backend.
 */
export async function checkSessionStatus() {
  const token = getStoredToken();
  if (!token) {
    return { success: false, valid: false, message: 'No active session' };
  }
  return await apiClient.get('/auth/check-session', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
