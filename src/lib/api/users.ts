import { apiFetch, setStoredToken } from './client';
import type { UpdateProfilePayload, UserProfile } from '../../types/auth';

export const usersApi = {
  listUsers() {
    return apiFetch<{ users: UserProfile[] }>('/api/users');
  },

  getProfile() {
    return apiFetch<{ profile: UserProfile }>('/api/users/profile');
  },

  acceptLegalPolicies() {
    return apiFetch<{ user: UserProfile }>('/api/users/legal-acceptance', {
      method: 'POST',
      body: JSON.stringify({ acceptPrivacy: true, acceptTerms: true }),
    });
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const result = await apiFetch<{ profile: UserProfile; token?: string }>('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (result.token) setStoredToken(result.token);
    return result;
  },
};
