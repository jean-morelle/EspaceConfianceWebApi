// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  role: string;
  isListener: boolean;
  isOnline: boolean;
  isBlocked: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

export interface UpdateProfileDto {
  username?: string;
  bio?: string;
  profilePicture?: string;
}

// ─── Friends ─────────────────────────────────────────────────────────────────

export type FriendRequestStatus = 'Pending' | 'Accepted' | 'Declined';

export interface FriendRequestDto {
  id: string;
  senderId: string;
  senderUsername: string;
  senderProfilePicture?: string;
  receiverId: string;
  receiverUsername: string;
  status: FriendRequestStatus;
  createdAt: string;
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderProfilePicture?: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
}

export interface ParticipantDto {
  userId: string;
  username: string;
  profilePicture?: string;
  isOnline: boolean;
}

export interface ConversationDto {
  id: string;
  createdAt: string;
  participants: ParticipantDto[];
  lastMessage?: MessageDto;
  unreadCount: number;
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export interface RoomDto {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isPublic: boolean;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  isJoined: boolean;
}

export interface RoomMessageDto {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  senderProfilePicture?: string;
  content: string;
  sentAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'NewMessage'
  | 'FriendRequest'
  | 'FriendRequestAccepted'
  | 'ListenerRequest'
  | 'SystemAlert';

export interface NotificationDto {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  type: NotificationType;
  referenceId?: string;
  createdAt: string;
}
