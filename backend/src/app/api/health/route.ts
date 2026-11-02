import { getDatabaseProvider } from '@/database/provider';
import { getSupabaseProjectHost, getSupabaseAdmin } from '@/database/supabase/client';
import { jsonResponse } from '@/lib/auth';
import { ensureServerBootstrap } from '@/lib/ensureServerBootstrap';
import { chatStorageHint, verifySupabaseSchema } from '@/lib/supabaseSchemaCheck';

export async function GET() {
  await ensureServerBootstrap();
  const provider = getDatabaseProvider();
  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
  const supabaseHost = getSupabaseProjectHost();

  if (provider === 'supabase') {
    try {
      const schema = await verifySupabaseSchema();
      if (!schema.ok) {
        return jsonResponse(
          {
            ok: false,
            provider,
            supabaseConfigured,
            supabaseHost,
            chatReady: !schema.missingTables.includes('document_comments'),
            presenceReady: !schema.missingTables.includes('document_chat_presence'),
            missingTables: schema.missingTables,
            hint:
              chatStorageHint(schema.missingTables) ??
              'Run backend/supabase/schema.sql in the Supabase SQL editor.',
            errors: schema.errors,
          },
          503,
        );
      }

      const { error } = await getSupabaseAdmin().from('users').select('email').limit(1);
      if (error) {
        return jsonResponse(
          {
            ok: false,
            provider,
            supabaseConfigured,
            supabaseHost,
            chatReady: false,
            hint: 'Run backend/supabase/schema.sql in the Supabase SQL editor.',
            error: error.message,
          },
          503,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Supabase connection failed';
      const fetchFailed = message.includes('fetch failed');
      return jsonResponse(
        {
          ok: false,
          provider,
          supabaseConfigured,
          supabaseHost,
          hint: fetchFailed
            ? 'Check SUPABASE_URL in Vercel: use Project URL https://xxxx.supabase.co (API settings), not the Postgres string. Redeploy after fixing.'
            : undefined,
          error: message,
        },
        503,
      );
    }
  }

  return jsonResponse({
    ok: true,
    provider,
    supabaseConfigured,
    supabaseHost,
    chatReady: provider === 'supabase' ? true : provider === 'json-files',
    presenceReady: provider === 'supabase' ? true : provider === 'json-files',
  });
}
