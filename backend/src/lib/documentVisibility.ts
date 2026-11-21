import { resolveDesignatedApproverEmail } from '@/lib/documentApproval';
import { resolveDocumentOwnerEmail, isAuthUserDocumentOwner } from '@/lib/documentOwnership';
import {
  isAuthUserInvolvedInOpenRevision,
  resolveDocumentForAuthUser,
} from '@/lib/documentPublishedBaseline';
import { normalizeTeamEmail } from '@/lib/legacyEmails';
import type { DocumentRecord } from '@/types';

function nameMatches(userName: string, value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return userName.trim().toLowerCase() === value.trim().toLowerCase();
}

/** Approved documents are visible to everyone with `view_documents`. */
export async function canAuthUserViewDocument(
  auth: { email: string; name: string },
  document: DocumentRecord,
): Promise<boolean> {
  if (document.publishedBaseline) return true;
  if (document.status === 'Active') return true;

  const email = normalizeTeamEmail(auth.email) ?? auth.email.trim().toLowerCase();
  const name = auth.name.trim().toLowerCase();

  const createdBy = normalizeTeamEmail(document.createdBy);
  if (createdBy && createdBy === email) return true;

  if (await isAuthUserDocumentOwner(email, document.owner)) return true;
  if (nameMatches(auth.name, document.owner)) return true;

  const ownerEmail = await resolveDocumentOwnerEmail(document.owner);
  if (ownerEmail && normalizeTeamEmail(ownerEmail) === email) return true;

  const approverEmail = await resolveDesignatedApproverEmail(document);
  if (approverEmail && normalizeTeamEmail(approverEmail) === email) return true;

  const approverField = document.approver?.trim();
  if (approverField) {
    if (approverField.includes('@') && normalizeTeamEmail(approverField) === email) return true;
    if (nameMatches(auth.name, approverField)) return true;
  }

  if (nameMatches(auth.name, document.approvedBy)) return true;
  if (nameMatches(auth.name, document.reviewedBy)) return true;

  return false;
}

export async function filterDocumentsForViewer(
  auth: { email: string; name: string },
  documents: DocumentRecord[],
): Promise<DocumentRecord[]> {
  const visible: DocumentRecord[] = [];
  for (const doc of documents) {
    if (await canAuthUserViewDocument(auth, doc)) {
      visible.push(await resolveDocumentForAuthUser(auth, doc));
    }
  }
  return visible;
}