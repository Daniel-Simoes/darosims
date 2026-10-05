import {
  appendDocumentEventRecord,
  backfillDocumentEventsIfNeeded,
  readAllDocumentEvents,
} from '@/repositories/audit/documentEventRepository';
import type { CreateDocumentEventInput, DocumentEventRecord, DocumentEventType } from '@/types';

export async function createDocumentEvent(
  input: CreateDocumentEventInput,
): Promise<DocumentEventRecord> {
  await backfillDocumentEventsIfNeeded();
  const event: DocumentEventRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  return appendDocumentEventRecord(event);
}

export async function listEventsForDocument(documentId: string): Promise<DocumentEventRecord[]> {
  await backfillDocumentEventsIfNeeded();
  const events = await readAllDocumentEvents();
  return events
    .filter((item) => item.documentId === documentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function listAllDocumentEvents(): Promise<DocumentEventRecord[]> {
  await backfillDocumentEventsIfNeeded();
  const events = await readAllDocumentEvents();
  return events.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function getLatestSubmissionType(
  documentId: string,
): Promise<DocumentEventType> {
  const events = await listEventsForDocument(documentId);
  const hasSubmission = events.some(
    (event) =>
      event.type === 'submitted' ||
      event.type === 'resubmitted' ||
      event.type === 'rejected',
  );
  return hasSubmission ? 'resubmitted' : 'submitted';
}
