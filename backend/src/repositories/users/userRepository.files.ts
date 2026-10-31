import { promises as fs } from 'fs';
import { DATA_DIR, USERS_FILE } from '@/config/paths';
import {
  normalizeUser,
  type StoredUser,
} from '@/repositories/users/userRepository.shared';
import type { AuthUser } from '@/types';

export type { StoredUser } from '@/repositories/users/userRepository.shared';
export { getPhotoFileName, getPhotoFilePath, normalizeUser } from '@/repositories/users/userRepository.shared';

function toPublicUser(user: StoredUser): AuthUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

async function ensureUsersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, '[]', 'utf-8');
  }
}

export async function readAllUsers(): Promise<StoredUser[]> {
  await ensureUsersFile();
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Array<Partial<StoredUser> & Pick<StoredUser, 'email' | 'password' | 'role'>>;
    return parsed.map((entry) => normalizeUser(entry));
  } catch {
    await fs.writeFile(USERS_FILE, '[]', 'utf-8');
    return [];
  }
}

export async function writeAllUsers(users: StoredUser[]) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readAllUsers();
  return users.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function findUserEmailByName(name: string): Promise<string | null> {
  const normalizedName = name.trim().toLowerCase();
  const users = await readAllUsers();
  const user = users.find((entry) => entry.name.toLowerCase() === normalizedName);
  return user?.email ?? null;
}

export async function listPublicUsers(): Promise<AuthUser[]> {
  const users = await readAllUsers();
  return users.map(toPublicUser);
}

export async function updateUserByEmail(
  email: string,
  updates: Partial<Pick<StoredUser, 'email' | 'name' | 'firstName' | 'lastName' | 'password' | 'photoUrl'>>,
): Promise<StoredUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readAllUsers();
  const index = users.findIndex((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (index === -1) return null;

  const current = users[index];
  const next = normalizeUser({
    ...current,
    ...updates,
    email: updates.email ?? current.email,
    password: updates.password ?? current.password,
  });

  users[index] = next;
  await writeAllUsers(users);
  return next;
}

export async function createUserIfMissing(
  input: Pick<StoredUser, 'email' | 'password' | 'role' | 'firstName' | 'lastName'>,
): Promise<void> {
  const existing = await findUserByEmail(input.email);
  if (existing) return;

  const users = await readAllUsers();
  users.push(normalizeUser(input));
  await writeAllUsers(users);
}

export async function syncSeedUser(
  input: Pick<StoredUser, 'email' | 'password' | 'role' | 'firstName' | 'lastName'>,
): Promise<void> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    await updateUserByEmail(input.email, input);
    return;
  }
  const users = await readAllUsers();
  users.push(normalizeUser(input));
  await writeAllUsers(users);
}

/** First admin from env when no users exist (production bootstrap). */
export async function ensureDefaultAdminFromEnv(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const users = await readAllUsers();
  if (users.length > 0) return;

  const admin = normalizeUser({
    email,
    password,
    role: 'admin',
    name: 'Administrator',
    firstName: 'Admin',
    lastName: '',
  });
  await writeAllUsers([admin]);
}
