import { getSupabaseAdmin } from '@/database/supabase/client';
import type { AuthUser } from '@/types';
import {
  getPhotoFileName,
  getPhotoFilePath,
  normalizeUser,
  type StoredUser,
} from '@/repositories/users/userRepository.files';

function toPublicUser(user: StoredUser): AuthUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

async function readRawUsers(): Promise<StoredUser[]> {
  const { data, error } = await getSupabaseAdmin().from('users').select('body');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeUser(row.body as StoredUser));
}

async function upsertUser(user: StoredUser): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('users')
    .upsert({ email: user.email, body: user }, { onConflict: 'email' });
  if (error) throw new Error(error.message);
}

export async function readAllUsers(): Promise<StoredUser[]> {
  return readRawUsers();
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('body')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeUser(data.body as StoredUser) : null;
}

export async function findUserEmailByName(name: string): Promise<string | null> {
  const normalizedName = name.trim().toLowerCase();
  const users = await readRawUsers();
  const user = users.find((entry) => entry.name.toLowerCase() === normalizedName);
  return user?.email ?? null;
}

export async function listPublicUsers(): Promise<AuthUser[]> {
  const users = await readRawUsers();
  return users.map(toPublicUser);
}

export async function updateUserByEmail(
  email: string,
  updates: Partial<Pick<StoredUser, 'email' | 'name' | 'firstName' | 'lastName' | 'password' | 'photoUrl'>>,
): Promise<StoredUser | null> {
  const current = await findUserByEmail(email);
  if (!current) return null;

  const next = normalizeUser({
    ...current,
    ...updates,
    email: updates.email ?? current.email,
    password: updates.password ?? current.password,
  });

  await upsertUser(next);
  if (next.email !== email.trim().toLowerCase()) {
    const { error } = await getSupabaseAdmin().from('users').delete().eq('email', email.trim().toLowerCase());
    if (error) throw new Error(error.message);
  }
  return next;
}

export { getPhotoFileName, getPhotoFilePath };

export async function createUserIfMissing(
  input: Pick<StoredUser, 'email' | 'password' | 'role' | 'firstName' | 'lastName'>,
): Promise<void> {
  const existing = await findUserByEmail(input.email);
  if (existing) return;
  await upsertUser(normalizeUser(input));
}

export async function ensureDefaultAdminFromEnv(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const users = await readRawUsers();
  if (users.length > 0) return;

  await upsertUser(
    normalizeUser({
      email,
      password,
      role: 'admin',
      name: 'Administrator',
      firstName: 'Admin',
      lastName: '',
    }),
  );
}
