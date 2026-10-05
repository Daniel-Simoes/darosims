export type DocumentEventType =
  | 'created'
  | 'submitted'
  | 'resubmitted'
  | 'rejected'
  | 'edited'
  | 'approved';

export interface DocumentEventMetadata {
  reason?: string;
  fileName?: string;
  action?: string;
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
