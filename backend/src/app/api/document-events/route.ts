import { formatDocumentCodeForRecord } from '@/lib/documentCode';
import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listAllDocumentEvents } from '@/lib/documentEvents';
import { listDocumentsForUser } from '@/lib/documents';
import { canAuthUserViewDocument } from '@/lib/documentVisibility';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const documentId = new URL(request.url).searchParams.get('documentId')?.trim();
    const [events, documents] = await Promise.all([
      listAllDocumentEvents(),
      listDocumentsForUser(auth),
    ]);

    const documentMap = new Map(documents.map((doc) => [doc.id, doc]));
    let filteredEvents = events.filter((event) => documentMap.has(event.documentId));
    if (documentId) {
      const doc = documentMap.get(documentId);
      if (!doc || !(await canAuthUserViewDocument(auth, doc))) {
        return jsonResponse({ timelines: [], total: 0 });
      }
      filteredEvents = filteredEvents.filter((event) => event.documentId === documentId);
    }

    const grouped = new Map<string, typeof filteredEvents>();
    for (const event of filteredEvents) {
      const current = grouped.get(event.documentId) ?? [];
      current.push(event);
      grouped.set(event.documentId, current);
    }

    const timelines = Array.from(grouped.entries())
      .map(([id, timelineEvents]) => {
        const document = documentMap.get(id);
        const latestEvent = timelineEvents[timelineEvents.length - 1];
        return {
          documentId: id,
          documentTitle: document?.title ?? 'Unknown document',
          documentCode: document ? formatDocumentCodeForRecord(document) : '',
          documentStatus: document?.status ?? 'Draft',
          events: timelineEvents.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
          latestAt: latestEvent?.createdAt ?? document?.createdAt ?? '',
        };
      })
      .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

    return jsonResponse({ timelines, total: timelines.length });
  } catch {
    return jsonResponse({ error: 'Failed to load document history' }, 500);
  }
}
