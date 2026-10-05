import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { getDocumentById, setDocumentFileName } from '@/lib/documents';
import {
  MAX_PDF_SIZE_BYTES,
  readDocumentFile,
  saveDocumentFile,
} from '@/lib/documentFiles';
import { isDocumentApprover } from '@/lib/users';

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

  const file = await readDocumentFile(id);
  if (!file) {
    return jsonResponse({ error: 'Document file not found' }, 404);
  }

  return new Response(new Uint8Array(file), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/pdf',
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

  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    return jsonResponse({ error: 'Document not found' }, 404);
  }

  const isInternalDraft =
    document.documentOrigin !== 'External' && document.status === 'Draft';

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'PDF file is required' }, 400);
    }

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isInternalDraft) {
      const isApprover = await isDocumentApprover(auth.email);
      if (!isApprover || !isPdf) {
        return jsonResponse(
          {
            error:
              'Unapproved internal documents must remain as Word. Approve the document to publish as PDF.',
          },
          400,
        );
      }
    } else if (!isPdf) {
      return jsonResponse({ error: 'Only PDF files are allowed' }, 400);
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      return jsonResponse({ error: 'File exceeds the 50 MB limit' }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await saveDocumentFile(id, buffer);

    const pdfFileName = isPdf ? file.name : `${file.name.replace(/\.[^.]+$/, '')}.pdf`;
    const updated = await setDocumentFileName(id, pdfFileName);
    if (!updated) {
      return jsonResponse({ error: 'Document not found' }, 404);
    }

    return jsonResponse({ document: updated });
  } catch {
    return jsonResponse({ error: 'Failed to upload file' }, 400);
  }
}
