import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listDocumentArchives } from '@/services/documents/documentArchiveService';
import { requirePermission } from '@/lib/security/authz';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const viewAuth = await requirePermission(auth, 'view_documents');
  if (viewAuth instanceof Response) return viewAuth;

  try {
    const archives = await listDocumentArchives();
    return jsonResponse({ archives, total: archives.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load archives';
    return jsonResponse({ error: message }, 500);
  }
}