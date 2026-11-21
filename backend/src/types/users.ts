import type { Permission } from './permissions';

export interface UserProfile {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'admin';
  photoUrl?: string;
  permissions: Permission[];
  legalPoliciesAcceptedAt?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  photoDataUrl?: string | null;
}
