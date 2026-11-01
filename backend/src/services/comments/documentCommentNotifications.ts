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

export async function notifyDocumentCommentRecipients(
  document: DocumentRecord,
  existingMessages: DocumentCommentMessage[],
  senderEmail: string,
  senderName: string,
): Promise<void> {
  const sender = normalizeEmail(senderEmail);
  const recipients = new Set<string>();

  async function addRecipient(value: string | undefined) {
    const email = await resolveRecipientEmail(value);
    if (email && email !== sender) {
      recipients.add(email);
    }
  }

  await addRecipient(document.createdBy);
  await addRecipient(document.approvedBy);
  const ownerEmail = await resolveDocumentOwnerEmail(document.owner);
  await addRecipient(ownerEmail ?? undefined);

  for (const message of existingMessages) {
    recipients.add(normalizeEmail(message.senderEmail));
  }
  recipients.delete(sender);

  const subject = document.title.trim() || 'Document';
  const body = `${senderName.trim() || senderEmail} sent you a message. Subject: ${subject}`;

  await Promise.all(
    [...recipients].map((recipientEmail) =>
      createNotification({
        recipientEmail,
        documentId: document.id,
        type: 'document_message',
        title: subject,
        message: body,
        actorName: senderName.trim() || senderEmail,
      }),
    ),
  );
}
