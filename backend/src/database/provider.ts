export type DatabaseProvider = 'json-files' | 'supabase';

export function getDatabaseProvider(): DatabaseProvider {
  if (
    process.env.DATABASE_PROVIDER === 'supabase' &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return 'supabase';
  }
  return 'json-files';
}

export function isSupabaseDatabase(): boolean {
  return getDatabaseProvider() === 'supabase';
}
