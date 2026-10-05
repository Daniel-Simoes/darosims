import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://')) {
    throw new Error(
      'SUPABASE_URL must be the HTTPS Project URL (https://xxxx.supabase.co), not the Postgres connection string.',
    );
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('SUPABASE_URL is not a valid URL. Copy it from Supabase → Project Settings → API.');
  }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) {
    throw new Error(
      'SUPABASE_URL must look like https://your-project-ref.supabase.co (from Supabase dashboard).',
    );
  }
  return trimmed;
}

export function getSupabaseProjectHost(): string | null {
  const raw = process.env.SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(normalizeSupabaseUrl(raw)).hostname;
  } catch {
    return null;
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL ?? '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required when DATABASE_PROVIDER=supabase');
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
