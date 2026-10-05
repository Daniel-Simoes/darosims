import type { Permission } from '../../types/auth';

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_documents: 'View documents',
  create_documents: 'Create documents',
  edit_documents: 'Edit documents',
  create_versions: 'Create versions',
  submit_documents: 'Submit documents',
  approve_documents: 'Approve documents',
  reject_documents: 'Reject documents',
  archive_documents: 'Archive documents',
  manage_users: 'Manage users',
  manage_companies: 'Manage companies',
  manage_settings: 'Manage settings',
  view_audit_logs: 'View audit logs',
};
