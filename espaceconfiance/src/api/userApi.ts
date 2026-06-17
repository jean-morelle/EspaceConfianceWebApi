import api from './axiosConfig';
import type { UpdateProfileDto, UserDto } from '../types';

export const userApi = {
  getMe: () => api.get<UserDto>('/users/me').then((r) => r.data),
  getUser: (id: string) => api.get<UserDto>(`/users/${id}`).then((r) => r.data),
  updateProfile: (dto: UpdateProfileDto) =>
    api.put<UserDto>('/users/me', dto).then((r) => r.data),
  search: (q: string) => api.get<UserDto[]>(`/users/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
  toggleListener: () => api.put('/users/me/listener'),
  block: (userId: string) => api.post(`/users/block/${userId}`),
  unblock: (userId: string) => api.delete(`/users/block/${userId}`),
  getBlocked: () => api.get<UserDto[]>('/users/blocked').then((r) => r.data),
};
