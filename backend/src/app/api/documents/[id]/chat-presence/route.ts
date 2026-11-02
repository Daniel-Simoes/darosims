import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import {
  listDocumentChatPresence,
  updateDocumentChatPresence,
} from '@/services/comments/documentChatPresenceService';
import { isMissingTableError } from '@/lib/supabaseSchemaCheck';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  try {
    const presence = await listDocumentChatPresence(id, auth.email);
    return jsonResponse({ presence });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load presence';
    if (isMissingTableError(message)) {
      return jsonResponse({ presence: [] });
    }
    return jsonResponse({ error: message }, 400);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Document id is required' }, 400);
  }

  try {
    const body = await request.json();
    const isTyping = Boolean(body.isTyping);
    await updateDocumentChatPresence(id, auth.email, auth.name, isTyping);
    return jsonResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update presence';
    if (isMissingTableError(message)) {
      return jsonResponse({ ok: true });
    }
    return jsonResponse({ error: message }, 400);
  }
}
