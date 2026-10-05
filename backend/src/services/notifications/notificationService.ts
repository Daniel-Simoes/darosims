import {
  appendNotificationRecord,
  deleteNotificationRecord,
  readAllNotifications,
  updateNotificationRecord,
} from '@/repositories/notifications/notificationRepository';
import type { CreateNotificationInput, NotificationRecord } from '@/types';

export async function listNotificationsForUser(recipientEmail: string): Promise<NotificationRecord[]> {
  const normalized = recipientEmail.trim().toLowerCase();
  const notifications = await readAllNotifications();
  return notifications
    .filter((item) => item.recipientEmail.toLowerCase() === normalized)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationRecord> {
  const notification: NotificationRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  return appendNotificationRecord(notification);
}

export async function markNotificationRead(
  id: string,
  recipientEmail: string,
): Promise<NotificationRecord | null> {
  return updateNotificationRecord(id, recipientEmail, { read: true });
}

export async function deleteNotification(
  id: string,
  recipientEmail: string,
): Promise<boolean> {
  return deleteNotificationRecord(id, recipientEmail);
}
