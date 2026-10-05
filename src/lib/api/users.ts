import { apiFetch, setStoredToken } from './client';
import type { UpdateProfilePayload, UserProfile } from '../../types/auth';

export const usersApi = {
  listUsers() {
    return apiFetch<{ users: UserProfile[] }>('/api/users');
  },

  getProfile() {
    return apiFetch<{ profile: UserProfile }>('/api/users/profile');
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const result = await apiFetch<{ profile: UserProfile; token: string }>('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (result.token) {
      setStoredToken(result.token);
    }
    return result;
  },
};
