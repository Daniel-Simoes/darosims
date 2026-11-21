import { corsHeaders, jsonResponseClearSession } from '@/lib/auth';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST() {
  return jsonResponseClearSession({ ok: true });
}