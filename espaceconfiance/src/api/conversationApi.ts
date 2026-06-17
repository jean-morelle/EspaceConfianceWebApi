import api from './axiosConfig';
import type { ConversationDto, MessageDto } from '../types';

export const conversationApi = {
  getAll: () => api.get<ConversationDto[]>('/conversations').then((r) => r.data),
  getOrCreate: (userId: string) =>
    api.post<ConversationDto>(`/conversations/with/${userId}`).then((r) => r.data),
  getMessages: (conversationId: string, page = 1, pageSize = 30) =>
    api
      .get<MessageDto[]>(`/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`)
      .then((r) => r.data),
  sendMessage: (conversationId: string, content: string) =>
    api
      .post<MessageDto>(`/conversations/${conversationId}/messages`, { content })
      .then((r) => r.data),
  markRead: (conversationId: string) =>
    api.put(`/conversations/${conversationId}/read`),
};
