import { requireAuth, jsonResponse, corsHeaders } from '@/lib/auth';
import { listAllDocumentEvents } from '@/lib/documentEvents';
import { listDocuments } from '@/lib/documents';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const documentId = new URL(request.url).searchParams.get('documentId')?.trim();
    const [events, documents] = await Promise.all([listAllDocumentEvents(), listDocuments()]);

    const documentMap = new Map(documents.map((doc) => [doc.id, doc]));
    const filteredEvents = documentId
      ? events.filter((event) => event.documentId === documentId)
      : events;

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
          documentCode: document?.documentOrigin === 'External'
            ? document.externalRef ?? ''
            : document?.code ?? '',
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
