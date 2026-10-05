import { promises as fs } from 'fs';
import { DATA_DIR, NOTIFICATIONS_FILE } from '@/config/paths';
import type { NotificationRecord } from '@/types';

const EMPTY_NOTIFICATIONS: NotificationRecord[] = [];

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(NOTIFICATIONS_FILE);
  } catch {
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(EMPTY_NOTIFICATIONS, null, 2), 'utf-8');
  }
}

export async function readAllNotifications(): Promise<NotificationRecord[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(raw) as NotificationRecord[];
  } catch {
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(EMPTY_NOTIFICATIONS, null, 2), 'utf-8');
    return EMPTY_NOTIFICATIONS;
  }
}

export async function writeAllNotifications(notifications: NotificationRecord[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
}

export async function appendNotificationRecord(
  notification: NotificationRecord,
): Promise<NotificationRecord> {
  const notifications = await readAllNotifications();
  notifications.push(notification);
  await writeAllNotifications(notifications);
  return notification;
}

export async function updateNotificationRecord(
  id: string,
  recipientEmail: string,
  update: Partial<NotificationRecord>,
): Promise<NotificationRecord | null> {
  const normalized = recipientEmail.trim().toLowerCase();
  const notifications = await readAllNotifications();
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
  const index = notifications.findIndex(
    (item) => item.id === id && item.recipientEmail.toLowerCase() === normalized,
  );
  if (index === -1) return false;
  notifications.splice(index, 1);
  await writeAllNotifications(notifications);
  return true;
}
