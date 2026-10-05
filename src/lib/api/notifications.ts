import { apiFetch } from './client';
import type { NotificationRecord, NotificationsResponse } from '../../types/notifications';

export const notificationsApi = {
  getNotifications() {
    return apiFetch<NotificationsResponse>('/api/notifications');
  },

  markNotificationRead(id: string) {
    return apiFetch<{ notification: NotificationRecord }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  deleteNotification(id: string) {
    return apiFetch<{ success: boolean }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};
