import type { AuthUser } from '@/lib/auth/utils';

import { client } from '@/lib/api/client';

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export async function loginRequest(email: string, password: string) {
  const { data } = await client.post<LoginResponse>('/api/auth/login', {
    email: email.trim(),
    password,
  });
  return data;
}

export async function logoutRequest() {
  try {
    await client.post('/api/auth/logout');
  }
  catch {
    // Stateless JWT: the client discards the token regardless.
  }
}

export async function fetchMe() {
  const { data } = await client.get<{ user: AuthUser }>('/api/auth/me');
  return data.user;
}

export async function forgotPasswordRequest(email: string) {
  const { data } = await client.post<{ message: string }>('/api/auth/forgot-password', {
    email: email.trim(),
  });
  return data;
}

export async function verifyOtpRequest(email: string, otp: string) {
  const { data } = await client.post<{
    message: string;
    resetAuthToken: string;
    resetAuthExpiresAt: string;
  }>('/api/auth/verify-otp', { email: email.trim(), otp });
  return data;
}

export async function resetPasswordRequest(resetAuthToken: string, password: string) {
  const { data } = await client.post<{ message: string }>('/api/auth/reset-password', {
    resetAuthToken,
    password,
  });
  return data;
}
