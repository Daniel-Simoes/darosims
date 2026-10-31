import { DEFAULT_SEED_USERS } from '@/lib/defaultSeedUsers';
import { syncSeedUser } from '@/repositories/users/userRepository';

export async function ensureDefaultSeedUsers(): Promise<void> {
  for (const seed of DEFAULT_SEED_USERS) {
    await syncSeedUser(seed);
  }
}
