import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import {
  createFieldOption,
  listFieldOptionsByCategory,
} from '@/services/config/documentFieldOptionsService';
import { isDocumentFieldOptionCategory } from '@/data/documentFieldDefaults';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const category = url.searchParams.get('category')?.trim() ?? '';

  if (!isDocumentFieldOptionCategory(category)) {
    return jsonResponse({ error: 'Invalid or missing category' }, 400);
  }

  try {
    const options = await listFieldOptionsByCategory(category);
    return jsonResponse({ category, options });
  } catch (err) {
    console.error('[document-field-options] list failed', err);
    return jsonResponse({ error: 'Could not load field options' }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = (await request.json()) as { category?: string; label?: string };
    const category = body.category?.trim() ?? '';
    const label = typeof body.label === 'string' ? body.label : '';

    if (!isDocumentFieldOptionCategory(category)) {
      return jsonResponse({ error: 'Invalid category' }, 400);
    }

    const { option, options } = await createFieldOption(category, label, auth.email);
    return jsonResponse({ option, category, options });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save option';
    return jsonResponse({ error: message }, 400);
  }
}