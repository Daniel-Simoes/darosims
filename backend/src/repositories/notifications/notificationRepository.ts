import { isSupabaseDatabase } from '@/database/provider';
import * as files from '@/repositories/notifications/notificationRepository.files';
import * as supabase from '@/repositories/notifications/notificationRepository.supabase';

const repo = isSupabaseDatabase() ? supabase : files;

export const readAllNotifications = repo.readAllNotifications;
export const writeAllNotifications = repo.writeAllNotifications;
export const appendNotificationRecord = repo.appendNotificationRecord;
export const updateNotificationRecord = repo.updateNotificationRecord;
export const deleteNotificationRecord = repo.deleteNotificationRecord;
