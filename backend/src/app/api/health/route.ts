import { env } from '@/config/env';
import { getDatabaseProvider } from '@/database/provider';
import { jsonResponse } from '@/lib/auth';
import { ensureServerBootstrap } from '@/lib/ensureServerBootstrap';
import { verifySupabaseSchema } from '@/lib/supabaseSchemaCheck';

export async function GET(request: Request) {
  const internal =
    request.headers.get('x-health-key')?.trim() === process.env.HEALTH_CHECK_KEY?.trim() &&
    Boolean(process.env.HEALTH_CHECK_KEY?.trim());

  try {
    await ensureServerBootstrap();
  } catch {
    return jsonResponse({ ok: false }, 503);
  }

  const provider = getDatabaseProvider();

  if (env.isProduction && !internal) {
    return jsonResponse({ ok: true });
  }

  if (provider === 'supabase') {
    const schema = await verifySupabaseSchema();
    if (!schema.ok) {
      return jsonResponse(
        {
          ok: false,
          provider,
          missingTables: schema.missingTables,
        },
        503,
      );
    }
  }

  return jsonResponse({
    ok: true,
    provider,
  });
}