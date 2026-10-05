export type NotificationType = 'approval_request' | 'document_approved' | 'document_rejected';

export interface NotificationRecord {
  id: string;
  recipientEmail: string;
  documentId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorName: string;
  createdAt: string;
  read: boolean;
}

export interface CreateNotificationInput {
  recipientEmail: string;
  documentId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorName: string;
}
