export interface AuthUser {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'admin';
  photoUrl?: string;
  permissions: Permission[];
  legalPoliciesAcceptedAt?: string;
}

export interface UserProfile extends AuthUser {}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  photoDataUrl?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  /** Legacy — session is stored in HttpOnly cookie. */
  token?: string;
}

export interface MeResponse {
  user: AuthUser;
}

/** Placeholder for future multi-tenant user model */
export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
}

/** Placeholder for future company model */
export interface Company {
  id: string;
  name: string;
}

export type Permission =
  | 'view_documents'
  | 'create_documents'
  | 'edit_documents'
  | 'create_versions'
  | 'submit_documents'
  | 'approve_documents'
  | 'reject_documents'
  | 'archive_documents'
  | 'manage_users'
  | 'manage_companies'
  | 'manage_settings'
  | 'view_audit_logs';
