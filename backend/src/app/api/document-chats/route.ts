import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { chatErrorResponse } from '@/lib/chatApiErrors';
import { listDocumentChatsForUser } from '@/services/comments/documentChatListService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    return chatErrorResponse(err, 'Failed to load chats');
  }
}
