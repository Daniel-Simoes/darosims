import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { canAuthUserDeleteDocumentArchive } from '@/lib/documentDelete';
import {
  deleteDocumentArchive,
  getDocumentArchiveById,
} from '@/services/documents/documentArchiveService';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!id?.trim()) {
    return jsonResponse({ error: 'Archive id is required' }, 400);
  }

  const archive = await getDocumentArchiveById(id);
  if (!archive) {
    return jsonResponse({ error: 'Archive not found' }, 404);
  }

  if (!canAuthUserDeleteDocumentArchive(auth, archive)) {
    return jsonResponse(
      {
        error: 'Only the person who approved this archived version can delete it.',
      },
      403,
    );
  }

  const deleted = await deleteDocumentArchive(id);
  if (!deleted) {
    return jsonResponse({ error: 'Archive not found' }, 404);
  }

  return jsonResponse({ success: true });
}