import { isSupabaseDatabase } from '@/database/provider';
import { DEFAULT_SEED_USERS } from '@/lib/defaultSeedUsers';
import {
  ensureDefaultAdminFromEnv,
  syncSeedUser,
} from '@/repositories/users/userRepository.supabase';

/** Next.js instrumentation — Supabase seed only; never import `userRepository.ts` (pulls in `fs`). */
export async function runInstrumentationBootstrap() {
  if (!isSupabaseDatabase()) return;
  for (const seed of DEFAULT_SEED_USERS) {
    await syncSeedUser(seed);
  }
  await ensureDefaultAdminFromEnv();
}
