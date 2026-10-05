import {
  deleteById,
  fetchAllBodies,
  replaceAllBodies,
  upsertBody,
} from '@/database/supabase/jsonTable';
import type { NotificationRecord } from '@/types';

export async function readAllNotifications(): Promise<NotificationRecord[]> {
  return fetchAllBodies<NotificationRecord>('notifications');
}

export async function writeAllNotifications(notifications: NotificationRecord[]): Promise<void> {
  await replaceAllBodies('notifications', notifications);
}

export async function appendNotificationRecord(
  notification: NotificationRecord,
): Promise<NotificationRecord> {
  await upsertBody('notifications', notification);
  return notification;
}

export async function updateNotificationRecord(
  id: string,
  recipientEmail: string,
  update: Partial<NotificationRecord>,
): Promise<NotificationRecord | null> {
  const notifications = await readAllNotifications();
  const normalized = recipientEmail.trim().toLowerCase();
  const index = notifications.findIndex(
    (item) => item.id === id && item.recipientEmail.toLowerCase() === normalized,
  );
  if (index === -1) return null;
  notifications[index] = { ...notifications[index], ...update };
  await writeAllNotifications(notifications);
  return notifications[index];
}

export async function deleteNotificationRecord(
  id: string,
  recipientEmail: string,
): Promise<boolean> {
  const normalized = recipientEmail.trim().toLowerCase();
  const notifications = await readAllNotifications();
  const exists = notifications.some(
    (item) => item.id === id && item.recipientEmail.toLowerCase() === normalized,
  );
  if (!exists) return false;
  return deleteById('notifications', id);
}
