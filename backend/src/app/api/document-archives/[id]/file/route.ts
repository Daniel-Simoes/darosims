import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getContentTypeForFile } from '@/lib/documentFileMeta';
import {
  getDocumentArchiveById,
  readArchiveFile,
} from '@/services/documents/documentArchiveService';
import { requirePermission } from '@/lib/security/authz';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const viewAuth = await requirePermission(auth, 'view_documents');
  if (viewAuth instanceof Response) return viewAuth;

  const { id } = await params;
  const archive = await getDocumentArchiveById(id);
  if (!archive?.fileName) {
    return jsonResponse({ error: 'Archive file not found' }, 404);
  }

  const file = await readArchiveFile(archive.id, archive.fileName);
  if (!file) {
    return jsonResponse({ error: 'Archive file not found' }, 404);
  }

  const contentType = getContentTypeForFile(
    archive.fileName,
    archive.fileFormat === 'pdf' ? 'application/pdf' : undefined,
  );

  return new Response(new Uint8Array(file), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${archive.fileName.replace(/"/g, '')}"`,
    },
  });
}