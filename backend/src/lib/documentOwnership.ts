import { findUserByEmail, findUserEmailByName } from '@/repositories/users/userRepository';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import { isAuthUserDesignatedApprover } from '@/lib/documentApproval';
import { isRejectedDocument } from '@/lib/documentWorkflow';
import { isAuthUserInvolvedInOpenRevision } from '@/lib/documentPublishedBaseline';
import type { DocumentRecord } from '@/types';

/** Resolve document owner field (display name or email) to a user email. */
export async function resolveDocumentOwnerEmail(owner: string | undefined): Promise<string | null> {
  const value = owner?.trim();
  if (!value) return null;

  if (value.includes('@')) {
    const normalized = normalizeTeamEmail(value) ?? value.toLowerCase();
    const byEmail = await findUserByEmail(normalized);
    return byEmail?.email ?? normalized;
  }

  const fromName = await findUserEmailByName(value);
  return fromName ? normalizeTeamEmail(fromName) ?? fromName : null;
}

export async function isAuthUserDocumentOwner(
  userEmail: string,
  owner: string | undefined,
): Promise<boolean> {
  const ownerEmail = await resolveDocumentOwnerEmail(owner);
  if (!ownerEmail) return false;
  return ownerEmail.toLowerCase() === userEmail.trim().toLowerCase();
}

export async function isAuthUserInvolvedInDocument(
  auth: { email: string; name: string },
  document: Pick<
    DocumentRecord,
    'createdBy' | 'owner' | 'approvedBy' | 'approver' | 'reviewedBy'
  >,
): Promise<boolean> {
  const email = auth.email.trim().toLowerCase();
  const name = auth.name.trim().toLowerCase();
  const createdBy = document.createdBy?.trim().toLowerCase() ?? '';

  if (createdBy && email === createdBy) return true;
  if (await isAuthUserDocumentOwner(email, document.owner)) return true;
  if (await isAuthUserDesignatedApprover(email, document)) return true;

  const approvedBy = document.approvedBy?.trim().toLowerCase();
  if (approvedBy && name === approvedBy) return true;

  const reviewedBy = document.reviewedBy?.trim().toLowerCase();
  if (reviewedBy && name === reviewedBy) return true;

  return false;
}

export async function canAuthUserEditDocument(
  auth: { email: string; name: string },
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
): Promise<boolean> {
  const email = auth.email.trim().toLowerCase();
  const createdBy = document.createdBy?.trim().toLowerCase() ?? '';

  if (isRejectedDocument(document)) {
    return Boolean(createdBy && email === createdBy);
  }

  if (document.status === 'Active') return false;

  if (document.publishedBaseline) {
    return isAuthUserInvolvedInOpenRevision(auth, document as DocumentRecord);
  }

  return isAuthUserInvolvedInDocument(auth, document);
}
