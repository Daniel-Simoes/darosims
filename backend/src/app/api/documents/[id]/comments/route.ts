import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listDocumentComments, postDocumentComment } from '@/lib/documentComments';

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
    const message = err instanceof Error ? err.message : 'Failed to load comments';
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
    const text = typeof body.text === 'string' ? body.text : '';
    const message = await postDocumentComment(id, auth.email, auth.name, text);
    return jsonResponse({ message });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send message';
    const status = message.includes('not found') ? 404 : 400;
    return jsonResponse({ error: message }, status);
  }
}
