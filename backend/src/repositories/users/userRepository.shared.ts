import { USER_PHOTOS_DIR } from '@/config/paths';
import { joinPath } from '@/lib/joinPath';
import { getPermissionsForRole } from '@/lib/permissions';
import type { AuthUser } from '@/types';

export interface StoredUser extends AuthUser {
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

export function normalizeUser(
  user: Partial<StoredUser> & Pick<StoredUser, 'email' | 'password' | 'role'>,
): StoredUser {
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

export function getPhotoFileName(email: string) {
  const safeEmail = email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeEmail}.jpg`;
}

export function getPhotoFilePath(email: string) {
  return joinPath(USER_PHOTOS_DIR, getPhotoFileName(email));
}
