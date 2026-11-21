import { apiFetch } from './client';
import type { LoginResponse, MeResponse } from '../../types/auth';

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, website: '' }),
    });
  },

  logout() {
    return apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  me() {
    return apiFetch<MeResponse>('/api/auth/me');
  },
};