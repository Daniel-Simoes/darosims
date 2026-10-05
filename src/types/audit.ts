import type { DocumentRecord } from './documents';

export type DocumentEventType =
  | 'created'
  | 'submitted'
  | 'resubmitted'
  | 'rejected'
  | 'edited'
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
