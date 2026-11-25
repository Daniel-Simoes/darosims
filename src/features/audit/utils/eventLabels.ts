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
    case 'version_archived':
      return 'Version archived';
    case 'approved':
      return 'Approved';
    case 'approval_meeting_scheduled':
      return 'Live review scheduled';
    case 'approval_meeting_started':
      return 'Live review started';
    case 'approval_meeting_ended':
      return 'Live review ended';
    case 'approval_meeting_cancelled':
      return 'Live review cancelled';
    case 'approval_meeting_rescheduled':
      return 'Live review rescheduled';
    case 'approval_meeting_reviewed':
      return 'Live review completed';
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
        ? `${event.actorName} opened a new update for version ${version} (draft). Submit for review when ready.`
        : `${event.actorName} started a new document revision for review and approval.`;
    }
    case 'version_archived': {
      const version = event.metadata?.version?.trim();
      const next = event.metadata?.supersededByVersion?.trim();
      if (version && next) {
        return `Version ${version} was archived after version ${next} was approved.`;
      }
      return version
        ? `Version ${version} was archived to Document Archives.`
        : `${event.actorName} archived a prior approved version.`;
    }
    case 'approved':
      return `${event.actorName} approved this document.`;
    case 'approval_meeting_scheduled':
      return `${event.actorName} scheduled a live review and approval meeting.`;
    case 'approval_meeting_started':
      return `${event.actorName} started the live review meeting.`;
    case 'approval_meeting_ended': {
      const action = event.metadata?.action;
      if (action === 'approved') {
        return `${event.actorName} completed the live session with approval.`;
      }
      if (action === 'rejected') {
        return `${event.actorName} completed the live session with rejection.`;
      }
      if (action === 'incomplete') {
        return `${event.actorName} ended the live review meeting before the approval cycle finished.`;
      }
      return `${event.actorName} ended the live review meeting.`;
    }
    case 'approval_meeting_rescheduled':
      return `${event.actorName} rescheduled the live review and approval meeting.`;
    case 'approval_meeting_reviewed':
      return `${event.actorName} marked the document as reviewed during the live session.`;
    case 'approval_meeting_cancelled':
      return event.metadata?.reason
        ? `${event.actorName} cancelled the live review meeting. Reason: ${event.metadata.reason}`
        : `${event.actorName} cancelled the live review meeting.`;
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
