import type { AuthUser } from '../../types/auth';

export const DOCUMENT_USERS = [
  { name: 'Daniel', email: 'daniel@darosapp.com' },
  { name: 'Rodrigo', email: 'rodrigo@daros.com' },
] as const;

export function canUserApproveDocuments(user: AuthUser | null): boolean {
  if (!user) return false;
  const normalizedEmail = user.email.trim().toLowerCase();
  return DOCUMENT_USERS.some((entry) => entry.email.toLowerCase() === normalizedEmail);
}

export function canUserDeleteDocument(
  user: AuthUser | null,
  document: { approvedBy?: string; createdBy?: string },
): boolean {
  if (!user) return false;

  if (document.approvedBy?.trim()) {
    return user.name.trim().toLowerCase() === document.approvedBy.trim().toLowerCase();
  }

  return user.email.trim().toLowerCase() === (document.createdBy?.trim().toLowerCase() ?? '');
}

export function getDocumentUserLabel(user: { name: string; email: string }) {
  return user.name;
}

export function isDocumentOwnerSameAsUser(
  user: AuthUser | null,
  ownerName: string | undefined,
): boolean {
  if (!user || !ownerName?.trim()) return false;
  return user.name.trim().toLowerCase() === ownerName.trim().toLowerCase();
}
