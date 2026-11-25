import { isSupabaseDatabase } from '@/database/provider';
import { bootstrapJsonFileStorage } from '@/lib/fileStorageSeedBootstrap';
import { ensureDefaultSeedUsers } from '@/lib/seedUsers';
import { migrateJsonUserPasswords } from '@/lib/security/migratePasswords';
import { assertProductionSecrets } from '@/config/env';
import { ensureDefaultAdminFromEnv } from '@/repositories/users/userRepository';
import { isMissingTableError } from '@/lib/supabaseSchemaCheck';

/** Full storage bootstrap — API routes only (Node.js), not instrumentation. */
export async function runServerBootstrap() {
  assertProductionSecrets();
  if (isSupabaseDatabase()) {
    try {
      await ensureDefaultSeedUsers();
      await ensureDefaultAdminFromEnv();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (isMissingTableError(message)) {
        throw new Error(
          'Supabase users table missing. Run backend/supabase/schema.sql in the SQL Editor.',
        );
      }
      throw err;
    }
    return;
  }

  await bootstrapJsonFileStorage();
  await migrateJsonUserPasswords();
  await ensureDefaultSeedUsers();
  await ensureDefaultAdminFromEnv();
}
