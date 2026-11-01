import type { AuthUser } from '../../types/auth';
import type { DocumentRecord } from '../../types/documents';
import { isDocumentOwnerSameAsUser } from '../documentUsers';
import { isPendingApprovalDocument } from './documentStatus';

export type DocumentCommentsBlockReason = 'self_approved' | 'self_owner_pending';

function isDocumentCreatorSameAsUser(user: AuthUser | null, createdBy?: string): boolean {
  if (!user?.email?.trim() || !createdBy?.trim()) return false;
  return user.email.trim().toLowerCase() === createdBy.trim().toLowerCase();
}

function isDocumentApproverSameAsUser(user: AuthUser | null, approvedBy?: string): boolean {
  if (!user?.name?.trim() || !approvedBy?.trim()) return false;
  return user.name.trim().toLowerCase() === approvedBy.trim().toLowerCase();
}

/**
 * When non-null, document chat should not open (creator + self as owner, no other approver).
 * Creator with a different document owner (e.g. pending approval) can still open chat.
 */
export function getDocumentCommentsBlockReason(
  document: DocumentRecord,
  user: AuthUser | null,
): DocumentCommentsBlockReason | null {
  if (!isDocumentCreatorSameAsUser(user, document.createdBy)) return null;
  if (!isDocumentOwnerSameAsUser(user, document.owner)) return null;

  if (document.status === 'Active' && isDocumentApproverSameAsUser(user, document.approvedBy)) {
    return 'self_approved';
  }

  if (isPendingApprovalDocument(document)) {
    return 'self_owner_pending';
  }

  return null;
}
