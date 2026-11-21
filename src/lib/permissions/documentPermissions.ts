import type { AuthUser } from '../../types/auth';
import type { DocumentRecord } from '../../types/documents';

export const DOCUMENT_USERS = [
  { name: 'Daniel', email: 'daniel@daros.com' },
  { name: 'Rodrigo', email: 'rodrigo@daros.com' },
  { name: 'Admin', email: 'admin@daros.com' },
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

export function isUserInvolvedInDocumentWorkflow(
  user: AuthUser | null,
  document: Pick<
    DocumentRecord,
    | 'createdBy'
    | 'owner'
    | 'approvedBy'
    | 'approver'
    | 'reviewedBy'
    | 'status'
    | 'submittedAt'
    | 'rejectionReason'
  >,
): boolean {
  if (!user) return false;

  const userEmail = user.email.trim().toLowerCase();
  const userName = user.name.trim().toLowerCase();
  const createdBy = document.createdBy?.trim().toLowerCase() ?? '';

  const rejected =
    document.status === 'Draft' &&
    !document.submittedAt &&
    Boolean(document.rejectionReason?.trim());
  if (rejected) {
    return Boolean(createdBy && userEmail === createdBy);
  }

  if (createdBy && userEmail === createdBy) return true;
  if (isDocumentOwnerSameAsUser(user, document.owner)) return true;

  const designatedApprover = (document.approver?.trim() || document.owner?.trim() || '').toLowerCase();
  if (designatedApprover && userName === designatedApprover) return true;
  if (designatedApprover && userEmail === designatedApprover) return true;

  const approvedBy = document.approvedBy?.trim().toLowerCase();
  if (approvedBy && userName === approvedBy) return true;

  const reviewedBy = document.reviewedBy?.trim().toLowerCase();
  if (reviewedBy && userName === reviewedBy) return true;

  return false;
}

/** Creator, reviewer, or approver may edit drafts; involved users may start a new version on Active docs. */
export function canUserEditDocument(
  user: AuthUser | null,
  document: Pick<
    DocumentRecord,
    | 'createdBy'
    | 'owner'
    | 'approvedBy'
    | 'approver'
    | 'reviewedBy'
    | 'status'
    | 'submittedAt'
    | 'rejectionReason'
    | 'publishedBaseline'
    | 'revisionStartedBy'
  >,
): boolean {
  if (document.status === 'Active') return false;

  const userEmail = user?.email.trim().toLowerCase() ?? '';
  const starter = document.revisionStartedBy?.trim().toLowerCase() ?? '';
  if (document.publishedBaseline && starter && userEmail === starter) return true;

  if (!isUserInvolvedInDocumentWorkflow(user, document)) return false;
  return true;
}

export function canUserCreateDocumentVersion(user: AuthUser | null): boolean {
  return Boolean(user?.permissions?.includes('create_versions'));
}

export function canUserStartApprovedDocumentRevision(
  user: AuthUser | null,
  document: Pick<
    DocumentRecord,
    | 'status'
    | 'createdBy'
    | 'owner'
    | 'approvedBy'
    | 'approver'
    | 'reviewedBy'
    | 'submittedAt'
    | 'rejectionReason'
  >,
): boolean {
  if (document.status !== 'Active') return false;
  if (!canUserCreateDocumentVersion(user)) return false;
  return isUserInvolvedInDocumentWorkflow(user, document);
}
