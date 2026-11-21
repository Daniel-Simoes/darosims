import type { AuthUser } from '../../types/auth';
import type { DocumentRecord } from '../../types/documents';
import { isDocumentOwnerSameAsUser } from '../permissions/documentPermissions';

export type ApproverUser = { name: string; email: string };

export function getDesignatedApprover(
  document: Pick<DocumentRecord, 'approver' | 'owner'>,
): string {
  return document.approver?.trim() || document.owner?.trim() || '';
}

export function resolveUserEmail(
  value: string | undefined,
  teamUsers: ApproverUser[],
): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (raw.includes('@')) return raw.toLowerCase();
  const match = teamUsers.find(
    (user) =>
      user.name.trim().toLowerCase() === raw.toLowerCase() ||
      user.email.trim().toLowerCase() === raw.toLowerCase(),
  );
  return match?.email.toLowerCase();
}

export function isUserDesignatedApprover(
  user: AuthUser | null,
  document: Pick<DocumentRecord, 'approver' | 'owner' | 'approvedBy'>,
  teamUsers: ApproverUser[],
): boolean {
  if (!user) return false;
  const designated = getDesignatedApprover(document);
  const approverEmail = resolveUserEmail(designated, teamUsers);
  if (approverEmail) {
    return user.email.trim().toLowerCase() === approverEmail;
  }
  return isDocumentOwnerSameAsUser(user, designated);
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

export function isReviewerSameAsApprover(
  document: Pick<DocumentRecord, 'approver' | 'owner'>,
): boolean {
  const owner = document.owner?.trim().toLowerCase() ?? '';
  const approver = getDesignatedApprover(document).toLowerCase();
  return Boolean(owner && approver && owner === approver);
}