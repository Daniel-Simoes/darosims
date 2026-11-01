import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listDocumentChatsForUser } from '@/services/comments/documentChatListService';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const chats = await listDocumentChatsForUser(auth.email, auth.name);
    return jsonResponse({ chats });
  } catch (err) {
    console.error('GET /api/document-chats error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load chats';
    return jsonResponse({ error: message }, 500);
  }
}
