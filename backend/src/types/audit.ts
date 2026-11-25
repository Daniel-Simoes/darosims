export type DocumentEventType =
  | 'created'
  | 'submitted'
  | 'resubmitted'
  | 'reviewed'
  | 'rejected'
  | 'edited'
  | 'revision_started'
  | 'version_archived'
  | 'approved'
  | 'approval_meeting_scheduled'
  | 'approval_meeting_started'
  | 'approval_meeting_ended'
  | 'approval_meeting_cancelled'
  | 'approval_meeting_rescheduled'
  | 'approval_meeting_reviewed';

export interface DocumentEventMetadata {
  reason?: string;
  fileName?: string;
  action?: string;
  version?: string;
  previousVersion?: string;
  supersededByVersion?: string;
  archivedId?: string;
  retired?: string;
  recipientEmail?: string;
  rejectionStage?: 'review' | 'approval';
  approvalMeetingId?: string;
  meetingDecisionId?: string;
}

export interface DocumentEventRecord {
  id: string;
  documentId: string;
  type: DocumentEventType;
  actorEmail?: string;
  actorName: string;
  createdAt: string;
  metadata?: DocumentEventMetadata;
}

export interface CreateDocumentEventInput {
  documentId: string;
  type: DocumentEventType;
  actorEmail?: string;
  actorName: string;
  metadata?: DocumentEventMetadata;
}

/** Future audit event types for PostgreSQL migration */
export type AuditEventType =
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_VERSION_CREATED'
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_RESUBMITTED'
  | 'DOCUMENT_ARCHIVED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED';
