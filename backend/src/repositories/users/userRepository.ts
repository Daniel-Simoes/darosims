import { getDatabaseProvider } from '@/database/provider';
import type { StoredUser } from '@/repositories/users/userRepository.shared';

export { getPhotoFileName, getPhotoFilePath } from '@/repositories/users/userRepository.shared';

type UserRepoModule =
  | typeof import('@/repositories/users/userRepository.files')
  | typeof import('@/repositories/users/userRepository.supabase');

async function repo(): Promise<UserRepoModule> {
  if (getDatabaseProvider() === 'supabase') {
    return import('@/repositories/users/userRepository.supabase');
  }
  return import('@/repositories/users/userRepository.files');
}

export async function readAllUsers() {
  return (await repo()).readAllUsers();
}

export async function findUserByEmail(email: string) {
  return (await repo()).findUserByEmail(email);
}

export async function findUserEmailByName(name: string) {
  return (await repo()).findUserEmailByName(name);
}

export async function listPublicUsers() {
  return (await repo()).listPublicUsers();
}

export async function updateUserByEmail(
  email: string,
  updates: Partial<
    Pick<StoredUser, 'email' | 'name' | 'firstName' | 'lastName' | 'password' | 'photoUrl'>
  >,
) {
  return (await repo()).updateUserByEmail(email, updates);
}

export async function ensureDefaultAdminFromEnv() {
  return (await repo()).ensureDefaultAdminFromEnv();
}

export async function createUserIfMissing(
  input: Pick<StoredUser, 'email' | 'password' | 'role' | 'firstName' | 'lastName'>,
) {
  return (await repo()).createUserIfMissing(input);
}

export async function syncSeedUser(
  input: Pick<StoredUser, 'email' | 'password' | 'role' | 'firstName' | 'lastName'>,
) {
  return (await repo()).syncSeedUser(input);
}
