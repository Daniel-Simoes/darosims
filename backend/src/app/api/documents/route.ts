import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { createDocument, listDocuments, listUserDrafts } from '@/lib/documents';
import { createDocumentEvent } from '@/lib/documentEvents';
import type { CreateDocumentInput } from '@/lib/types';
import { requirePermission } from '@/lib/security/authz';
import { parseListLimit, slicePage } from '@/lib/security/pagination';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const viewAuth = await requirePermission(auth, 'view_documents');
  if (viewAuth instanceof Response) return viewAuth;

  try {
    const searchParams = new URL(request.url).searchParams;
    const limit = parseListLimit(searchParams);
    const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0);

    const scope = searchParams.get('scope');
    if (scope === 'drafts') {
      const allDrafts = await listUserDrafts(auth.email);
      const documents = slicePage(allDrafts, limit, offset);
      return jsonResponse({ documents, total: allDrafts.length, limit, offset });
    }

    const all = await listDocuments();
    const documents = slicePage(all, limit, offset);
    return jsonResponse({ documents, total: all.length, limit, offset });
  } catch (err) {
    console.error('GET /api/documents error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load documents';
    return jsonResponse({ error: message }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const createAuth = await requirePermission(auth, 'create_documents');
  if (createAuth instanceof Response) return createAuth;

  try {
    const body = await request.json();

    if (!body.title?.trim()) {
      return jsonResponse({ error: 'Document title is required' }, 400);
    }

    const documentType = String(body.type ?? '').trim();
    if (!documentType) {
      return jsonResponse({ error: 'Document type is required' }, 400);
    }

    if (!body.process?.trim()) {
      return jsonResponse({ error: 'Process is required' }, 400);
    }

    const isExternal = body.documentOrigin === 'External';

    if (isExternal && !body.externalVersion?.trim()) {
      return jsonResponse({ error: 'Version / Edition is required for external documents' }, 400);
    }

    let hasIso = false;
    if (body.hasIso !== undefined && body.hasIso !== null && body.hasIso !== '') {
      if (typeof body.hasIso === 'boolean') {
        hasIso = body.hasIso;
      } else {
        const normalized = String(body.hasIso).trim().toLowerCase();
        if (normalized === 'true' || normalized === 'yes') hasIso = true;
        else if (normalized === 'false' || normalized === 'no') hasIso = false;
        else {
          return jsonResponse({ error: 'Invalid ISO-related value' }, 400);
        }
      }
    }

    const manualCode =
      body.code !== undefined && body.code !== null ? String(body.code).trim() : '';

    if (!isExternal && hasIso && !manualCode) {
      return jsonResponse({ error: 'Document code is required for ISO-related documents' }, 400);
    }

    const input: CreateDocumentInput = {
      type: documentType,
      hasIso,
      code: !isExternal && hasIso ? manualCode : undefined,
      process: String(body.process).trim(),
      title: String(body.title).trim(),
      version: isExternal ? undefined : body.version !== undefined ? Number(body.version) : 1,
      documentOrigin: body.documentOrigin,
      externalRef: body.externalRef,
      externalVersion: body.externalVersion,
      owner: body.owner,
      approver: body.approver,
      approvedBy: body.approvedBy,
      department: body.department,
      effectiveDate: body.effectiveDate,
      reviewFrequency: body.reviewFrequency,
      nextReviewDate: body.nextReviewDate,
      repository: body.repository,
      distribution: body.distribution,
      retentionPeriod: body.retentionPeriod,
      retentionNotes: body.retentionNotes,
      disposition: body.disposition,
      comments: body.comments,
      status: 'Draft',
    };

    const document = await createDocument(input, auth.email);
    await createDocumentEvent({
      documentId: document.id,
      type: 'created',
      actorEmail: auth.email,
      actorName: auth.name,
    });
    return jsonResponse({ document }, 201);
  } catch (err) {
    console.error('POST /api/documents error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create document';
    return jsonResponse({ error: message }, 400);
  }
}
