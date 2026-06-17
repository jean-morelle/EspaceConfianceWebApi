import api from './axiosConfig';
import type { RoomDto, RoomMessageDto } from '../types';

export const roomApi = {
  getPublic: () => api.get<RoomDto[]>('/rooms').then((r) => r.data),
  getMine: () => api.get<RoomDto[]>('/rooms/mine').then((r) => r.data),
  get: (id: string) => api.get<RoomDto>(`/rooms/${id}`).then((r) => r.data),
  join: (id: string) => api.post(`/rooms/${id}/join`),
  leave: (id: string) => api.delete(`/rooms/${id}/leave`),
  getMessages: (id: string, page = 1) =>
    api.get<RoomMessageDto[]>(`/rooms/${id}/messages?page=${page}`).then((r) => r.data),
  sendMessage: (id: string, content: string) =>
    api.post<RoomMessageDto>(`/rooms/${id}/messages`, { content }).then((r) => r.data),
};
