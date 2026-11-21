import { isTeamApproverEmail } from '@/config/teamUsers';
import {
  findUserByEmail,
  findUserEmailByName,
  listPublicUsers,
  readAllUsers,
  updateUserByEmail,
} from '@/repositories/users/userRepository';
import { hashPasswordDev, isPasswordHash, verifyPassword } from '@/lib/security/password';
import type { AuthUser } from '@/types';

async function upgradeLegacyPasswordIfNeeded(email: string, plain: string, stored: string) {
  if (isPasswordHash(stored)) return;
  const hash = await hashPasswordDev(plain);
  try {
    await updateUserByEmail(email, { password: hash });
  } catch {
    // Best-effort rehash after legacy login
  }
}

export async function validateCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password))) {
    return null;
  }

  if (!isPasswordHash(user.password)) {
    await upgradeLegacyPasswordIfNeeded(user.email, password, user.password);
  }

  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export async function listUsers(): Promise<AuthUser[]> {
  return listPublicUsers();
}

export async function isDocumentApprover(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return Boolean(user && isTeamApproverEmail(user.email));
}

export async function getUserEmailByName(name: string): Promise<string | null> {
  return findUserEmailByName(name);
}

export async function isDocumentOwnerSameAsEmail(
  ownerName: string | undefined,
  email: string,
): Promise<boolean> {
  if (!ownerName?.trim() || !email?.trim()) return false;
  const ownerEmail = await findUserEmailByName(ownerName);
  return ownerEmail?.toLowerCase() === email.trim().toLowerCase();
}

/** Internal access for repositories that need user lookup during backfill */
export { readAllUsers };