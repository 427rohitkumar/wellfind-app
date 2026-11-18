import axios from 'axios';
import Env from 'env';

import { getAuthState } from '@/features/auth/use-auth-store';

export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getAuthState().token?.access;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

client.interceptors.response.use(
  response => response,
  (error) => {
    const url: string = error?.config?.url ?? '';
    // Expired / invalid session on a protected endpoint -> force sign out.
    if (
      error?.response?.status === 401
      && !url.includes('/api/auth/login')
      && getAuthState().status === 'signIn'
    ) {
      getAuthState().signOut();
    }
    return Promise.reject(error);
  },
);

/**
 * Backend returns two shapes: `{ error }` (legacy) and `{ success, message, errors }`.
 * Normalise both into a human readable string.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const e = error as any;
  if (e?.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection.';
  }
  if (e?.isAxiosError && !e.response) {
    return 'Cannot reach the server. Please check your internet connection.';
  }
  const data = e?.response?.data;
  if (data) {
    if (Array.isArray(data.errors) && data.errors.length > 0 && data.errors[0]?.message) {
      return data.errors.map((x: any) => x.message).join('\n');
    }
    if (typeof data.message === 'string' && data.message) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error) {
      return data.error;
    }
  }
  return e?.message || fallback;
}

/** Unwraps `{ success, data }` envelopes; passes raw payload shapes through. */
export function unwrap<T>(body: any): T {
  return body && typeof body === 'object' && 'success' in body && 'data' in body
    ? body.data
    : body;
}
