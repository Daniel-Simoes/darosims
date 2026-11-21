import { isSupabaseDatabase } from '@/database/provider';
import { ensureDefaultSeedUsers } from '@/lib/seedUsers';
import { ensureDefaultAdminFromEnv } from '@/repositories/users/userRepository.supabase';

/** Next.js instrumentation — Supabase seed only; never import `userRepository.ts` (pulls in `fs`). */
export async function runInstrumentationBootstrap() {
  if (!isSupabaseDatabase()) return;
  await ensureDefaultSeedUsers();
  await ensureDefaultAdminFromEnv();
}