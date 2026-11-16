import { findUserByEmail, findUserEmailByName } from '@/repositories/users/userRepository';
import type { DocumentRecord } from '@/types';

/** Resolve document owner field (display name or email) to a user email. */
export async function resolveDocumentOwnerEmail(owner: string | undefined): Promise<string | null> {
  const value = owner?.trim();
  if (!value) return null;

  if (value.includes('@')) {
    const byEmail = await findUserByEmail(value);
    return byEmail?.email ?? value.toLowerCase();
  }

  return findUserEmailByName(value);
}

export async function isAuthUserDocumentOwner(
  userEmail: string,
  owner: string | undefined,
): Promise<boolean> {
  const ownerEmail = await resolveDocumentOwnerEmail(owner);
  if (!ownerEmail) return false;
  return ownerEmail.toLowerCase() === userEmail.trim().toLowerCase();
}

export async function canAuthUserEditDocument(
  auth: { email: string; name: string },
  document: Pick<DocumentRecord, 'createdBy' | 'owner' | 'approvedBy'>,
): Promise<boolean> {
  const email = auth.email.trim().toLowerCase();
  const name = auth.name.trim().toLowerCase();
  const createdBy = document.createdBy?.trim().toLowerCase() ?? '';

  if (createdBy && email === createdBy) return true;
  if (await isAuthUserDocumentOwner(email, document.owner)) return true;

  const approvedBy = document.approvedBy?.trim().toLowerCase();
  if (approvedBy && name === approvedBy) return true;

  return false;
}
