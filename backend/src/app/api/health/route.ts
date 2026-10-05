import { getDatabaseProvider } from '@/database/provider';
import { jsonResponse } from '@/lib/auth';

export async function GET() {
  const provider = getDatabaseProvider();
  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );

  if (provider === 'supabase') {
    try {
      const { getSupabaseAdmin } = await import('@/database/supabase/client');
      const { error } = await getSupabaseAdmin().from('users').select('email').limit(1);
      if (error) {
        return jsonResponse(
          {
            ok: false,
            provider,
            supabaseConfigured,
            hint: 'Run backend/supabase/schema.sql in the Supabase SQL editor.',
            error: error.message,
          },
          503,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Supabase connection failed';
      return jsonResponse({ ok: false, provider, supabaseConfigured, error: message }, 503);
    }
  }

  return jsonResponse({ ok: true, provider, supabaseConfigured });
}
