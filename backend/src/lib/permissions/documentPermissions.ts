import type { AuthUser } from '@/types';
import { isDocumentApprover as checkApprover } from '@/services/users/userService';
import { findUserEmailByName } from '@/repositories/users/userRepository';

export async function isDocumentApprover(email: string): Promise<boolean> {
  return checkApprover(email);
}

export async function isDocumentOwnerSameAsEmail(
  ownerName: string | undefined,
  email: string,
): Promise<boolean> {
  if (!ownerName?.trim() || !email?.trim()) return false;
  const ownerEmail = await findUserEmailByName(ownerName);
  return ownerEmail?.toLowerCase() === email.trim().toLowerCase();
}

export function toAuthActor(user: Pick<AuthUser, 'email' | 'name'>) {
  return { actorEmail: user.email, actorName: user.name };
}
