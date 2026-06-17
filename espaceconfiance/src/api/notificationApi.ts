import api from './axiosConfig';
import type { NotificationDto } from '../types';

export const notificationApi = {
  getAll: () => api.get<NotificationDto[]>('/notifications').then((r) => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
  markAllRead: () => api.put('/notifications/read-all'),
};
