import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { chatErrorResponse } from '@/lib/chatApiErrors';
import { isMissingTableError } from '@/lib/supabaseSchemaCheck';
import {
  deleteDocumentConversation,
  listDocumentComments,
  postDocumentComment,
} from '@/lib/documentComments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function commentErrorResponse(err: unknown, fallbackMessage: string) {
  const message = err instanceof Error ? err.message : fallbackMessage;
  if (isMissingTableError(message)) {
    return chatErrorResponse(err, fallbackMessage);
  }
  if (message.includes('not found')) {
    return jsonResponse({ error: message }, 404);
  }
  return jsonResponse({ error: message }, 400);
}

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
    const messages = await listDocumentComments(id);
    return jsonResponse({ messages });
  } catch (err) {
    return commentErrorResponse(err, 'Failed to load comments');
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
    const text = typeof body.text === 'string' ? body.text : '';
    const message = await postDocumentComment(id, auth.email, auth.name, text);
    return jsonResponse({ message });
  } catch (err) {
    return commentErrorResponse(err, 'Failed to send message');
  }
}

export async function DELETE(
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
    await deleteDocumentConversation(id, auth.email, auth.name);
    return jsonResponse({ ok: true });
  } catch (err) {
    return commentErrorResponse(err, 'Failed to delete conversation');
  }
}
