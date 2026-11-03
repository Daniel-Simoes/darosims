import { resolveDocumentOwnerEmail } from '@/lib/documentOwnership';
import { createNotification } from '@/lib/notifications';
import { findUserEmailByName } from '@/repositories/users/userRepository';
import type { DocumentCommentMessage, DocumentRecord } from '@/types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function resolveRecipientEmail(value: string | undefined): Promise<string | null> {
  if (!value?.trim()) return null;
  if (value.includes('@')) return normalizeEmail(value);
  return findUserEmailByName(value);
}

/**
 * Only the first message in a thread triggers an in-app/bell notification (chat opened).
 * Further messages are surfaced via the Chat sidebar badge on the client.
 */
export async function notifyDocumentCommentRecipients(
  document: DocumentRecord,
  existingMessages: DocumentCommentMessage[],
  senderEmail: string,
  senderName: string,
): Promise<void> {
  if (existingMessages.length > 0) {
    return;
  }

  const sender = normalizeEmail(senderEmail);
  const recipients = new Set<string>();

  async function addRecipient(value: string | undefined) {
    const email = await resolveRecipientEmail(value);
    if (email && email !== sender) {
      recipients.add(email);
    }
  }

  await addRecipient(document.createdBy);

  if (document.status === 'Active' && document.approvedBy?.trim()) {
    await addRecipient(document.approvedBy);
  } else if (document.owner?.trim()) {
    await addRecipient(document.owner);
    const ownerEmail = await resolveDocumentOwnerEmail(document.owner);
    await addRecipient(ownerEmail ?? undefined);
  }

  const subject = document.title.trim() || 'Document';
  const opener = senderName.trim() || senderEmail;
  const body = `${opener} opened a chat for this document. Open Chat to reply.`;

  await Promise.all(
    [...recipients].map((recipientEmail) =>
      createNotification({
        recipientEmail,
        documentId: document.id,
        type: 'document_message',
        title: `Chat opened — ${subject}`,
        message: body,
        actorName: opener,
      }),
    ),
  );
}
