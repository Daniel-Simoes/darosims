import { isTeamApproverEmail } from '@/config/teamUsers';
import {
  findUserByEmail,
  findUserEmailByName,
  listPublicUsers,
  readAllUsers,
} from '@/repositories/users/userRepository';
import type { AuthUser } from '@/types';

export async function validateCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    return null;
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
