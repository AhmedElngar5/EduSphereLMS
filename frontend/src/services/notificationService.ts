import api from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  getNotifications: async (unreadOnly?: boolean, limit = 50): Promise<NotificationItem[]> => {
    const response = await api.get<NotificationItem[]>('/notifications', {
      params: { unreadOnly, limit },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<{ markedReadCount: number }> => {
    const response = await api.post<{ markedReadCount: number }>('/notifications/mark-all-read');
    return response.data;
  },
};
