import {
  fetchAllBodies,
  replaceAllBodies,
  upsertBody,
} from '@/database/supabase/jsonTable';
import type { DocumentEventRecord } from '@/types';
import { readAllDocuments } from '@/repositories/documents/documentRepository';
import { readAllNotifications } from '@/repositories/notifications/notificationRepository';
import { readAllUsers } from '@/repositories/users/userRepository';

export async function readAllDocumentEvents(): Promise<DocumentEventRecord[]> {
  return fetchAllBodies<DocumentEventRecord>('document_events');
}

export async function writeAllDocumentEvents(events: DocumentEventRecord[]): Promise<void> {
  await replaceAllBodies('document_events', events);
}

export async function appendDocumentEventRecord(
  event: DocumentEventRecord,
): Promise<DocumentEventRecord> {
  await upsertBody('document_events', event);
  return event;
}

function parseRejectionReason(message: string): string | undefined {
  const marker = 'Reason: ';
  const index = message.lastIndexOf(marker);
  if (index === -1) return undefined;
  return message.slice(index + marker.length).trim() || undefined;
}

export async function backfillDocumentEventsIfNeeded(): Promise<void> {
  const existing = await readAllDocumentEvents();
  if (existing.length > 0) return;

  const documents = await readAllDocuments();
  const notifications = await readAllNotifications();
  const users = await readAllUsers();
  const userNames = new Map(users.map((user) => [user.email.toLowerCase(), user.name]));
  const events: DocumentEventRecord[] = [];

  for (const document of documents) {
    events.push({
      id: crypto.randomUUID(),
      documentId: document.id,
      type: 'created',
      actorEmail: document.createdBy,
      actorName: userNames.get(document.createdBy.toLowerCase()) ?? document.createdBy,
      createdAt: document.createdAt,
    });
  }

  const submissionCounts = new Map<string, number>();
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (const notification of sortedNotifications) {
    switch (notification.type) {
      case 'approval_request': {
        const count = submissionCounts.get(notification.documentId) ?? 0;
        submissionCounts.set(notification.documentId, count + 1);
        events.push({
          id: crypto.randomUUID(),
          documentId: notification.documentId,
          type: count === 0 ? 'submitted' : 'resubmitted',
          actorName: notification.actorName,
          createdAt: notification.createdAt,
        });
        break;
      }
      case 'document_rejected':
        events.push({
          id: crypto.randomUUID(),
          documentId: notification.documentId,
          type: 'rejected',
          actorName: notification.actorName,
          createdAt: notification.createdAt,
          metadata: {
            reason: parseRejectionReason(notification.message),
          },
        });
        break;
      case 'document_approved':
        events.push({
          id: crypto.randomUUID(),
          documentId: notification.documentId,
          type: 'approved',
          actorName: notification.actorName,
          createdAt: notification.createdAt,
        });
        break;
    }
  }

  events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  await writeAllDocumentEvents(events);
}
