import { isSupabaseDatabase } from '@/database/provider';
import { bootstrapJsonFileStorage } from '@/lib/fileStorageSeedBootstrap';
import { ensureDefaultSeedUsers } from '@/lib/seedUsers';
import { ensureDefaultAdminFromEnv } from '@/repositories/users/userRepository';

/** Full storage bootstrap — API routes only (Node.js), not instrumentation. */
export async function runServerBootstrap() {
  if (isSupabaseDatabase()) {
    await ensureDefaultSeedUsers();
    await ensureDefaultAdminFromEnv();
    return;
  }

  await bootstrapJsonFileStorage();
  await ensureDefaultSeedUsers();
  await ensureDefaultAdminFromEnv();
}
