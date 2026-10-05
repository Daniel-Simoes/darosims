import { getDatabaseProvider } from '@/database/provider';
import * as files from '@/repositories/notifications/notificationRepository.files';
import * as supabase from '@/repositories/notifications/notificationRepository.supabase';

function repo() {
  return getDatabaseProvider() === 'supabase' ? supabase : files;
}

export async function readAllNotifications() {
  return repo().readAllNotifications();
}

export async function writeAllNotifications(notifications: Parameters<typeof files.writeAllNotifications>[0]) {
  return repo().writeAllNotifications(notifications);
}

export async function appendNotificationRecord(notification: Parameters<typeof files.appendNotificationRecord>[0]) {
  return repo().appendNotificationRecord(notification);
}

export async function updateNotificationRecord(
  id: string,
  recipientEmail: string,
  update: Parameters<typeof files.updateNotificationRecord>[2],
) {
  return repo().updateNotificationRecord(id, recipientEmail, update);
}

export async function deleteNotificationRecord(id: string, recipientEmail: string) {
  return repo().deleteNotificationRecord(id, recipientEmail);
}
