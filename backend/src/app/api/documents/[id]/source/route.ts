import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById } from '@/lib/documents';
import { readDocumentSourceFile } from '@/lib/documentFiles';

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

  return jsonResponse(
    {
      error:
        'Word and text source uploads are no longer supported. Upload a PDF using the document file endpoint.',
    },
    400,
  );
}
