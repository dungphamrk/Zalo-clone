/**
 * Chat interfaces
 */

export interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  avatar?: string | null;
  senderName?: string | null;
  timestamp?: string;
  read?: boolean;
  chatId?: string;
  replyToText?: string;
}

export interface MessageReactionResponse {
  userId: number;
  userName: string | null;
  userAvatar: string | null;
  reaction: string;
  reactedAt: string;
}

export interface ReactionSummary {
  totalCount: number;
  byType: Record<string, number>; // reaction -> count
  recentByUsers: MessageReactionResponse[];
}

export interface MessageResponseDTO {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string | null;
  senderAvatar: string | null;
  content: string | null;
  metadata?: string | null;
  createdAt: string;
  editedAt?: string | null;
  deleted: boolean;
  replyToMessageId?: string | null;
  replyTo?: {
    id: number;
    senderId: number | null;
    senderName: string | null;
    senderAvatar: string | null;
    content: string | null;
    createdAt: string | null;
  } | null;
  reactions?: MessageReactionResponse[];
  reactionSummary?: ReactionSummary;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  phone: string;
  time: string;
  unreadCount?: number;
  messages?: Message[];
  type?: string;
  title?: string;
  avatarUrl?: string | null;
  members?: Array<{
    userId: number;
    userName: string | null;
    avatarUrl: string | null;
    role?: string;
  }>;
}

export interface SendMessageRequest {
  chatId: string;
  text: string;
}

export interface CreateChatRequest {
  phone: string;
}

