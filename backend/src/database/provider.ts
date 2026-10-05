export type DatabaseProvider = 'json-files' | 'supabase';

export function getDatabaseProvider(): DatabaseProvider {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (provider === 'supabase' && url && key) {
    return 'supabase';
  }
  return 'json-files';
}

export function isSupabaseDatabase(): boolean {
  return getDatabaseProvider() === 'supabase';
}
