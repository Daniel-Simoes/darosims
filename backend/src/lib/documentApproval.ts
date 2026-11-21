import { findUserEmailByName } from '@/repositories/users/userRepository';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import type { DocumentRecord } from '@/types';

export function getDesignatedApprover(document: Pick<DocumentRecord, 'approver' | 'owner'>): string {
  return document.approver?.trim() || document.owner?.trim() || '';
}

export async function resolveDesignatedApproverEmail(
  document: Pick<DocumentRecord, 'approver' | 'owner'>,
): Promise<string | null> {
  const value = getDesignatedApprover(document);
  if (!value) return null;
  if (value.includes('@')) return normalizeTeamEmail(value) ?? value.toLowerCase();
  const fromName = await findUserEmailByName(value);
  return fromName ? normalizeTeamEmail(fromName) ?? fromName : null;
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
  const normalizedUser = normalizeTeamEmail(userEmail) ?? userEmail.trim().toLowerCase();
  return normalizeTeamEmail(approverEmail) === normalizedUser;
}