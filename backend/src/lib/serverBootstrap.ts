import { isSupabaseDatabase } from '@/database/provider';
import { bootstrapJsonFileStorage } from '@/lib/fileStorageSeedBootstrap';
import { ensureDefaultSeedUsers } from '@/lib/seedUsers';
import { migrateJsonUserPasswords } from '@/lib/security/migratePasswords';
import { assertProductionSecrets } from '@/config/env';
import { ensureDefaultAdminFromEnv } from '@/repositories/users/userRepository';

/** Full storage bootstrap — API routes only (Node.js), not instrumentation. */
export async function runServerBootstrap() {
  assertProductionSecrets();
  if (isSupabaseDatabase()) {
    await ensureDefaultSeedUsers();
    await ensureDefaultAdminFromEnv();
    return;
  }

  await bootstrapJsonFileStorage();
  await migrateJsonUserPasswords();
  await ensureDefaultSeedUsers();
  await ensureDefaultAdminFromEnv();
}
