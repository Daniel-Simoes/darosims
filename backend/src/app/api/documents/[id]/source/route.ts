import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, setDocumentFileName } from '@/lib/documents';
import {
  MAX_SOURCE_SIZE_BYTES,
  readDocumentSourceFile,
  saveDocumentSourceFile,
} from '@/lib/documentFiles';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function getSourceExtension(file: File): string | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.txt')) return 'txt';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (file.type === 'text/plain') return 'txt';
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  const source = await readDocumentSourceFile(id);
  if (!source) {
    return jsonResponse({ error: 'Source file not found' }, 404);
  }

  const contentType =
    source.extension === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'text/plain';

  return new Response(new Uint8Array(source.buffer), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${(document.fileName ?? `document.${source.extension}`).replace(/"/g, '')}"`,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  if (document.documentOrigin === 'External') {
    return jsonResponse({ error: 'External documents use PDF upload only' }, 400);
  }

  if (document.status !== 'Draft') {
    return jsonResponse({ error: 'Source files can only be uploaded for draft documents' }, 400);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Document file is required' }, 400);
    }

    const extension = getSourceExtension(file);
    if (!extension) {
      return jsonResponse({ error: 'Only Word (.docx) or text (.txt) files are allowed' }, 400);
    }

    if (file.size > MAX_SOURCE_SIZE_BYTES) {
      return jsonResponse({ error: 'File exceeds the 50 MB limit' }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await saveDocumentSourceFile(id, buffer, extension);

    const updated = await setDocumentFileName(id, file.name);
    if (!updated) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    return jsonResponse({ document: updated });
  } catch {
    return jsonResponse({ error: 'Failed to upload source file' }, 400);
  }
}
