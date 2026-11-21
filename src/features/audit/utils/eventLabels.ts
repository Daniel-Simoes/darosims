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
      return 'Rejection recorded';
    case 'edited':
      return 'Edited by creator';
    case 'revision_started':
      return 'Revision started';
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
    case 'rejected': {
      const stage = event.metadata?.rejectionStage;
      const stageLabel =
        stage === 'approval'
          ? 'rejected final approval'
          : stage === 'review'
            ? 'rejected the document at review'
            : 'did not approve this document';
      return event.metadata?.reason
        ? `${event.actorName} ${stageLabel}. Reason: ${event.metadata.reason}`
        : `${event.actorName} ${stageLabel}.`;
    }
    case 'edited':
      if (event.metadata?.action === 'file_replaced') {
        return event.metadata.fileName
          ? `${event.actorName} replaced the document file (${event.metadata.fileName}).`
          : `${event.actorName} replaced the document file.`;
      }
      return `${event.actorName} edited the document content.`;
    case 'revision_started': {
      const version = event.metadata?.version?.trim();
      return version
        ? `${event.actorName} started an update to version ${version}. The document returned to draft for review and approval.`
        : `${event.actorName} started a new document revision for review and approval.`;
    }
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
    case 'revision_started':
      return 'edited';
    case 'approved':
      return 'approved';
    default:
      return 'default';
  }
}
