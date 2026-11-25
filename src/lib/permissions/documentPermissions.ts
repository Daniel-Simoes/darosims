import type { AuthUser } from '../../types/auth';
import type { DocumentRecord } from '../../types/documents';
import {
  isPendingApprovalDocument,
  isPendingFinalApprovalDocument,
  isRejectedDocument,
} from '../documentStatus';

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

function matchesApproverIdentity(
  user: AuthUser,
  approverLabel: string | undefined,
): boolean {
  if (!approverLabel?.trim()) return false;
  const ref = approverLabel.trim().toLowerCase();
  if (user.name.trim().toLowerCase() === ref) return true;
  if (user.email.trim().toLowerCase() === ref) return true;
  const byName = DOCUMENT_USERS.find(
    (entry) => entry.name.trim().toLowerCase() === ref,
  );
  if (byName && user.email.trim().toLowerCase() === byName.email.toLowerCase()) return true;
  return false;
}

/** Live records in Document Control: only never-approved drafts (creator). Approved → delete only from Archives. */
export function canUserDeleteDocument(
  user: AuthUser | null,
  document: {
    status?: string;
    approvedBy?: string;
    createdBy?: string;
    publishedBaseline?: { approvedBy?: string };
  },
): boolean {
  if (!user) return false;

  const lockedInControl =
    document.status === 'Active' ||
    Boolean(document.publishedBaseline) ||
    Boolean(document.approvedBy?.trim());

  if (lockedInControl) return false;

  return user.email.trim().toLowerCase() === (document.createdBy?.trim().toLowerCase() ?? '');
}

export function canUserDeleteDocumentArchive(
  user: AuthUser | null,
  archive: { approvedBy?: string },
): boolean {
  if (!user) return false;
  return matchesApproverIdentity(user, archive.approvedBy?.trim());
}

/** Retire an approved live document into Document Archives (approver only). */
export function canUserArchiveDocument(
  user: AuthUser | null,
  document: {
    status?: string;
    approvedBy?: string;
    publishedBaseline?: unknown;
    documentOrigin?: string;
  },
): boolean {
  if (!user) return false;
  if (document.status !== 'Active') return false;
  if (document.publishedBaseline) return false;
  if (document.documentOrigin === 'External') return false;
  return matchesApproverIdentity(user, document.approvedBy?.trim());
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

/** Creator of the record or whoever started the current revision cycle. */
export function isUserDocumentElaborator(
  user: AuthUser | null,
  document: Pick<DocumentRecord, 'createdBy' | 'revisionStartedBy' | 'publishedBaseline'>,
): boolean {
  if (!user) return false;
  const userEmail = user.email.trim().toLowerCase();
  const createdBy = document.createdBy?.trim().toLowerCase() ?? '';
  const starter = document.revisionStartedBy?.trim().toLowerCase() ?? '';
  if (document.publishedBaseline) {
    return Boolean(starter && userEmail === starter);
  }
  return Boolean(createdBy && userEmail === createdBy);
}

function isUserDesignatedFinalApprover(
  user: AuthUser,
  document: Pick<DocumentRecord, 'approver' | 'owner'>,
): boolean {
  const designated = document.approver?.trim() || document.owner?.trim() || '';
  if (!designated) return false;
  if (designated.includes('@')) {
    return user.email.trim().toLowerCase() === designated.toLowerCase();
  }
  return isDocumentOwnerSameAsUser(user, designated);
}

function isUserDocumentReviewer(user: AuthUser, owner: string | undefined): boolean {
  return isDocumentOwnerSameAsUser(user, owner);
}

function isUserDocumentCreator(
  user: AuthUser,
  document: Pick<DocumentRecord, 'createdBy' | 'revisionStartedBy' | 'publishedBaseline'>,
): boolean {
  const userEmail = user.email.trim().toLowerCase();
  const createdBy = document.createdBy?.trim().toLowerCase() ?? '';
  if (createdBy && userEmail === createdBy) return true;
  const starter = document.revisionStartedBy?.trim().toLowerCase() ?? '';
  return Boolean(document.publishedBaseline && starter && userEmail === starter);
}

/**
 * Edit rights by workflow stage:
 * - Before review: creator + reviewer (owner).
 * - After review, before approval: designated approver only.
 * - After approval (Active): none (new version only).
 * - Rejected: creator / revision starter only.
 */
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
  if (!user) return false;
  if (document.status === 'Active') return false;

  if (isRejectedDocument(document)) {
    return isUserDocumentElaborator(user, document);
  }

  if (isPendingFinalApprovalDocument(document)) {
    return isUserDesignatedFinalApprover(user, document);
  }

  if (isPendingApprovalDocument(document)) {
    return (
      isUserDocumentCreator(user, document) || isUserDocumentReviewer(user, document.owner)
    );
  }

  if (document.status === 'Draft' && !document.submittedAt) {
    return (
      isUserDocumentCreator(user, document) || isUserDocumentReviewer(user, document.owner)
    );
  }

  return isUserDocumentCreator(user, document);
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
    | 'revisionStartedBy'
    | 'publishedBaseline'
    | 'owner'
    | 'approvedBy'
    | 'approver'
    | 'reviewedBy'
    | 'submittedAt'
    | 'rejectionReason'
  >,
): boolean {
  if (document.status !== 'Active') return false;
  if (document.publishedBaseline) return false;
  if (!canUserCreateDocumentVersion(user)) return false;
  if (isUserDocumentElaborator(user, document)) return true;
  return isUserInvolvedInDocumentWorkflow(user, document);
}
