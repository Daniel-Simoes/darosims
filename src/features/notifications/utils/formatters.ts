import type { NotificationRecord } from '../../../types/notifications';

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  actorName?: string;
  time: string;
  createdAt: string;
  unread?: boolean;
  documentId?: string;
  approvalMeetingId?: string;
  type?: NotificationRecord['type'];
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatNotificationDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function toDashboardNotification(notification: NotificationRecord): DashboardNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    actorName: notification.actorName,
    time: formatRelativeTime(notification.createdAt),
    createdAt: notification.createdAt,
    unread: !notification.read,
    documentId: notification.documentId,
    approvalMeetingId: notification.approvalMeetingId,
    type: notification.type,
  };
}

export function getNotificationTypeLabel(type?: NotificationRecord['type']) {
  switch (type) {
    case 'review_request':
      return 'Review request';
    case 'approval_request':
      return 'Approval request';
    case 'document_reviewed':
      return 'Review completed';
    case 'document_approved':
      return 'Document approved';
    case 'document_rejected':
      return 'Not approved';
    case 'document_message':
      return 'Document message';
    case 'lgpd_request':
      return 'LGPD request';
    case 'live_meeting_invitation':
      return 'Live meeting';
    case 'live_meeting_rescheduled':
      return 'Meeting rescheduled';
    case 'live_meeting_cancelled':
      return 'Meeting cancelled';
    case 'live_meeting_ended':
      return 'Meeting ended';
    default:
      return 'Notification';
  }
}
