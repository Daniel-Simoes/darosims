/** Placeholder types for future multi-tenant SaaS functionality */

export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface Role {
  id: string;
  companyId: string;
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

export interface UserCompanyRole {
  userId: string;
  companyId: string;
  roleId: string;
  permissions: Permission[];
}
