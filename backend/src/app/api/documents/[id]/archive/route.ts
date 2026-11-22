import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, deleteDocument } from '@/lib/documents';
import { canAuthUserArchiveDocument } from '@/lib/documentDelete';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';
import { createDocumentEvent } from '@/lib/documentEvents';
import { archiveRetiredActiveDocument } from '@/services/documents/documentArchiveService';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
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

  const existing = await getDocumentById(id);
  if (!existing) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  if (!(await canAuthUserViewDocument(auth, existing))) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  if (!canAuthUserArchiveDocument(auth, existing)) {
    return jsonResponse(
      {
        error: 'Only the person who approved this document can archive it.',
      },
      403,
    );
  }

  try {
    const archive = await archiveRetiredActiveDocument(existing, auth);
    await deleteDocument(id);

    await createDocumentEvent({
      documentId: id,
      type: 'version_archived',
      actorEmail: auth.email,
      actorName: auth.name,
      metadata: {
        version: String(archive.version),
        archivedId: archive.id,
        retired: 'true',
      },
    });

    return jsonResponse({ archive });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to archive document';
    return jsonResponse({ error: message }, 400);
  }
}