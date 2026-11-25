export type NotificationType =
  | 'review_request'
  | 'approval_request'
  | 'document_reviewed'
  | 'document_approved'
  | 'document_rejected'
  | 'document_message'
  | 'lgpd_request'
  | 'live_meeting_invitation'
  | 'live_meeting_rescheduled'
  | 'live_meeting_cancelled'
  | 'live_meeting_ended';

export interface NotificationRecord {
  id: string;
  recipientEmail: string;
  documentId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorName?: string;
  createdAt: string;
  read: boolean;
  approvalMeetingId?: string;
}

export interface NotificationsResponse {
  notifications: NotificationRecord[];
  total: number;
}
