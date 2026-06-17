import api from './axiosConfig';
import type { FriendRequestDto, UserDto } from '../types';

export const friendApi = {
  getFriends: () => api.get<UserDto[]>('/friends').then((r) => r.data),
  getPendingRequests: () =>
    api.get<FriendRequestDto[]>('/friends/requests').then((r) => r.data),
  sendRequest: (receiverId: string) => api.post(`/friends/request/${receiverId}`),
  accept: (requestId: string) => api.put(`/friends/request/${requestId}/accept`),
  decline: (requestId: string) => api.put(`/friends/request/${requestId}/decline`),
  remove: (friendId: string) => api.delete(`/friends/${friendId}`),
};
