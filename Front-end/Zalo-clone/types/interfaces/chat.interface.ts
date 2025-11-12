/**
 * Chat interfaces
 */

export interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  avatar?: string;
  timestamp?: string;
  read?: boolean;
  chatId?: string;
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
}

export interface SendMessageRequest {
  chatId: string;
  text: string;
}

export interface CreateChatRequest {
  phone: string;
}

