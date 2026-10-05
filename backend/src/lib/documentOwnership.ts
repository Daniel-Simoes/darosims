import { findUserByEmail, findUserEmailByName } from '@/repositories/users/userRepository';

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
