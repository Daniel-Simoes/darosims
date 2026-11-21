import type { DocumentEventRecord } from '../../../types/audit';

export function getDocumentEventLabel(type: DocumentEventRecord['type']) {
  switch (type) {
    case 'created':
      return 'Document created';
    case 'reviewed':
      return 'Review completed';
    case 'submitted':
      return 'Sent for approval';
    case 'resubmitted':
      return 'Resent for approval';
    case 'rejected':
      return 'Not approved';
    case 'edited':
      return 'Edited by creator';
    case 'approved':
      return 'Approved';
    default:
      return 'Event';
  }
}

export function getDocumentEventDescription(event: DocumentEventRecord) {
  switch (event.type) {
    case 'created':
      return `${event.actorName} created this document.`;
    case 'reviewed':
      return event.metadata?.recipientEmail
        ? `${event.actorName} reviewed this document and sent it for final approval.`
        : `${event.actorName} reviewed this document.`;
    case 'submitted':
      return `${event.actorName} submitted this document for approval.`;
    case 'resubmitted':
      return `${event.actorName} uploaded changes and sent the document for approval again.`;
    case 'rejected':
      return event.metadata?.reason
        ? `${event.actorName} did not approve this document. Reason: ${event.metadata.reason}`
        : `${event.actorName} did not approve this document.`;
    case 'edited':
      if (event.metadata?.action === 'file_replaced') {
        return event.metadata.fileName
          ? `${event.actorName} replaced the document file (${event.metadata.fileName}).`
          : `${event.actorName} replaced the document file.`;
      }
      return `${event.actorName} edited the document content.`;
    case 'approved':
      return `${event.actorName} approved this document.`;
    default:
      return event.actorName;
  }
}

export function getDocumentEventTone(type: DocumentEventRecord['type']) {
  switch (type) {
    case 'created':
      return 'created';
    case 'reviewed':
      return 'submitted';
    case 'submitted':
    case 'resubmitted':
      return 'submitted';
    case 'rejected':
      return 'rejected';
    case 'edited':
      return 'edited';
    case 'approved':
      return 'approved';
    default:
      return 'default';
  }
}
