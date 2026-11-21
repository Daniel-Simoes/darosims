import { DEFAULT_SEED_USERS } from '@/lib/defaultSeedUsers';
import { hashPasswordDev } from '@/lib/security/password';
import { syncSeedUser } from '@/repositories/users/userRepository';

export async function ensureDefaultSeedUsers(): Promise<void> {
  const plain = process.env.DEV_SEED_PASSWORD?.trim();
  if (!plain) return;

  const password = await hashPasswordDev(plain);

  for (const seed of DEFAULT_SEED_USERS) {
    await syncSeedUser({
      ...seed,
      password,
    });
  }
}