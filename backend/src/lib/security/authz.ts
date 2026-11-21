import { findUserByEmail } from '@/repositories/users/userRepository';
import { getPermissionsForRole } from '@/lib/permissions';
import type { AuthUser, JwtPayload, Permission } from '@/types';
import { jsonResponse } from '@/lib/auth';

export async function loadAuthUser(email: string): Promise<AuthUser | null> {
  const stored = await findUserByEmail(email);
  if (!stored) return null;
  const { password: _password, ...user } = stored;
  return {
    ...user,
    permissions: user.permissions ?? getPermissionsForRole(user.role),
  };
}

export function hasPermission(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export async function requirePermission(
  auth: JwtPayload,
  permission: Permission,
): Promise<AuthUser | Response> {
  const user = await loadAuthUser(auth.email);
  if (!user) {
    return jsonResponse({ error: 'User not found' }, 403);
  }
  if (!hasPermission(user, permission)) {
    return jsonResponse({ error: 'You do not have permission for this action' }, 403);
  }
  return user;
}