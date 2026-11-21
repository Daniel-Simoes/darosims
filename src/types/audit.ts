import type { DocumentRecord } from './documents';

export type DocumentEventType =
  | 'created'
  | 'submitted'
  | 'resubmitted'
  | 'reviewed'
  | 'rejected'
  | 'edited'
  | 'revision_started'
  | 'version_archived'
  | 'approved';

export interface DocumentEventRecord {
  id: string;
  documentId: string;
  type: DocumentEventType;
  actorEmail?: string;
  actorName: string;
  createdAt: string;
  metadata?: {
    reason?: string;
    fileName?: string;
    action?: string;
    version?: string;
    previousVersion?: string;
    supersededByVersion?: string;
    recipientEmail?: string;
    /** Set on reject: owner declined at review vs approver declined at final approval. */
    rejectionStage?: 'review' | 'approval';
  };
}

export interface DocumentTimeline {
  documentId: string;
  documentTitle: string;
  documentCode: string;
  documentStatus: DocumentRecord['status'];
  events: DocumentEventRecord[];
  latestAt: string;
}

export interface DocumentEventsResponse {
  timelines: DocumentTimeline[];
  total: number;
}
