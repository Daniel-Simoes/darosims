import { promises as fs } from 'fs';
import { DATA_DIR } from '@/config/paths';
import { joinPath } from '@/lib/joinPath';
import { hashPasswordDev, isPasswordHash } from '@/lib/security/password';
import type { StoredUser } from '@/repositories/users/userRepository.shared';

/** One-time migration for local JSON user store — removes plaintext passwords from disk. */
export async function migrateJsonUserPasswords(): Promise<void> {
  const filePath = joinPath(DATA_DIR, 'users.json');
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf-8');
  } catch {
    return;
  }

  const users = JSON.parse(raw) as StoredUser[];
  let changed = false;

  for (const user of users) {
    if (!user.password || isPasswordHash(user.password)) continue;
    user.password = await hashPasswordDev(user.password);
    changed = true;
  }

  if (changed) {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');
  }
}