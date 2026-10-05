import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR, USERS_FILE, USER_PHOTOS_DIR } from '@/config/paths';
import { getPermissionsForRole } from '@/lib/permissions';
import type { AuthUser } from '@/types';

interface StoredUser extends AuthUser {
  password: string;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function buildDisplayName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
}

function normalizeUser(user: Partial<StoredUser> & Pick<StoredUser, 'email' | 'password' | 'role'>): StoredUser {
  const derivedName = splitName(user.name ?? '');
  const firstName = user.firstName?.trim() || derivedName.firstName;
  const lastName = user.lastName?.trim() ?? derivedName.lastName;
  const name = buildDisplayName(firstName, lastName) || user.email.split('@')[0];

  return {
    email: user.email.trim().toLowerCase(),
    password: user.password,
    name,
    firstName,
    lastName,
    role: user.role,
    photoUrl: user.photoUrl,
    permissions: user.permissions ?? getPermissionsForRole(user.role),
  };
}

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

async function writeAllUsers(users: StoredUser[]) {
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

export function getPhotoFileName(email: string) {
  const safeEmail = email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeEmail}.jpg`;
}

export function getPhotoFilePath(email: string) {
  return path.join(USER_PHOTOS_DIR, getPhotoFileName(email));
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
