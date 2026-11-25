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
  | 'approved'
  | 'approval_meeting_scheduled'
  | 'approval_meeting_started'
  | 'approval_meeting_ended'
  | 'approval_meeting_cancelled'
  | 'approval_meeting_rescheduled'
  | 'approval_meeting_reviewed';

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
    approvalMeetingId?: string;
    meetingDecisionId?: string;
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
