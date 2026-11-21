import type { DocumentRecord } from '../../types/documents';
import type { AuthUser } from '../../types/auth';
import {
  isDocumentOwnerSameAsUser,
  isUserInvolvedInDocumentWorkflow,
} from '../documentUsers';
import { isUserDesignatedApprover } from './documentApprovalWorkflow';

export type DocumentPublishedBaseline = NonNullable<DocumentRecord['publishedBaseline']>;

export function hasOpenDocumentRevision(document: DocumentRecord | null | undefined): boolean {
  return Boolean(document?.publishedBaseline);
}

export function isUserInvolvedInOpenRevision(
  user: AuthUser | null,
  document: DocumentRecord,
  teamUsers: { name: string; email: string }[],
): boolean {
  if (!user) return false;
  if (!document.publishedBaseline) {
    return isUserInvolvedInDocumentWorkflow(user, document);
  }

  const userEmail = user.email.trim().toLowerCase();
  const starter = document.revisionStartedBy?.trim().toLowerCase() ?? '';
  if (starter && userEmail === starter) return true;

  if (isUserInvolvedInDocumentWorkflow(user, document)) return true;

  const baseline = document.publishedBaseline;
  if (isDocumentOwnerSameAsUser(user, baseline.owner)) return true;
  if (isUserDesignatedApprover(user, { ...document, approver: baseline.approver, owner: baseline.owner }, teamUsers)) {
    return true;
  }

  const approvedBy = baseline.approvedBy?.trim().toLowerCase();
  if (approvedBy && user.name.trim().toLowerCase() === approvedBy) return true;

  return false;
}