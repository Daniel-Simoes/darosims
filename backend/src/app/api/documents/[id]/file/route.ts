import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, setDocumentFileName } from '@/lib/documents';
import {
  getContentTypeForFile,
  inferDocumentFileFormat,
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  validateUploadedDocumentFile,
} from '@/lib/documentFileMeta';
import { readDocumentFile, saveDocumentFile } from '@/lib/documentFiles';
import { requirePermission } from '@/lib/security/authz';
import { canAuthUserEditDocument } from '@/lib/documentOwnership';

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
  const document = await getDocumentById(id);
  if (!document?.fileName) {
    return jsonResponse({ error: 'Document file not found' }, 404);
  }

  const file = await readDocumentFile(id, document.fileName);
  if (!file) {
    return jsonResponse({ error: 'Document file not found' }, 404);
  }

  const contentType = getContentTypeForFile(document.fileName, document.fileFormat === 'pdf' ? 'application/pdf' : undefined);

  return new Response(new Uint8Array(file), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${document.fileName.replace(/"/g, '')}"`,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const uploadAuth = await requirePermission(auth, 'edit_documents');
  if (uploadAuth instanceof Response) return uploadAuth;

  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  if (!(await canAuthUserEditDocument(auth, document))) {
    return jsonResponse({ error: 'You are not allowed to upload files for this document' }, 403);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'A file is required' }, 400);
    }

    const validationError = validateUploadedDocumentFile(file);
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
      return jsonResponse({ error: 'File exceeds the 50 MB limit' }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await saveDocumentFile(id, buffer, file.name);

    const fileFormat = inferDocumentFileFormat(file.name, file.type);
    const updated = await setDocumentFileName(id, file.name, fileFormat);
    if (!updated) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    return jsonResponse({ document: updated });
  } catch {
    return jsonResponse({ error: 'Failed to upload file' }, 400);
  }
}