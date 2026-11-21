import { findUserEmailByName } from '@/repositories/users/userRepository';
import type { DocumentRecord } from '@/types';

export function getDesignatedApprover(document: Pick<DocumentRecord, 'approver' | 'owner'>): string {
  return document.approver?.trim() || document.owner?.trim() || '';
}

export async function resolveDesignatedApproverEmail(
  document: Pick<DocumentRecord, 'approver' | 'owner'>,
): Promise<string | null> {
  const value = getDesignatedApprover(document);
  if (!value) return null;
  if (value.includes('@')) return value.toLowerCase();
  return findUserEmailByName(value);
}

export function isPendingDocumentReview(
  document: Pick<DocumentRecord, 'status' | 'submittedAt' | 'reviewedAt'>,
): boolean {
  return document.status === 'Draft' && Boolean(document.submittedAt) && !document.reviewedAt;
}

export function isPendingDocumentApproval(
  document: Pick<DocumentRecord, 'status' | 'reviewedAt'>,
): boolean {
  return document.status === 'Draft' && Boolean(document.reviewedAt);
}

export async function isAuthUserDesignatedApprover(
  userEmail: string,
  document: Pick<DocumentRecord, 'approver' | 'owner' | 'approvedBy'>,
): Promise<boolean> {
  const approverEmail = await resolveDesignatedApproverEmail(document);
  if (!approverEmail) return false;
  return approverEmail.toLowerCase() === userEmail.trim().toLowerCase();
}