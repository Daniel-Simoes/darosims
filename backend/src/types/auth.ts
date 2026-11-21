import type { Permission } from './permissions';

export interface AuthUser {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'admin';
  photoUrl?: string;
  permissions: Permission[];
  /** ISO timestamp when the user accepted Privacy Policy and Terms in-app */
  legalPoliciesAcceptedAt?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin';
}
