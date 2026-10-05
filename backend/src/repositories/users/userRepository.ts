import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/users/userRepository.files';
import * as supabase from '@/repositories/users/userRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllUsers() {
  return repo().readAllUsers();
}

export async function findUserByEmail(email: string) {
  return repo().findUserByEmail(email);
}

export async function findUserEmailByName(name: string) {
  return repo().findUserEmailByName(name);
}

export async function listPublicUsers() {
  return repo().listPublicUsers();
}

export async function updateUserByEmail(
  email: string,
  updates: Parameters<typeof files.updateUserByEmail>[1],
) {
  return repo().updateUserByEmail(email, updates);
}

export function getPhotoFileName(email: string) {
  return repo().getPhotoFileName(email);
}

export function getPhotoFilePath(email: string) {
  return repo().getPhotoFilePath(email);
}

export async function ensureDefaultAdminFromEnv() {
  return repo().ensureDefaultAdminFromEnv();
}
