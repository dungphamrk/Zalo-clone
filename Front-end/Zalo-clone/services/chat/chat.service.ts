/**
 * Chat service
 * Contains API calls for chat functionality
 * Updated to use /conversations endpoints from backend
 */

import {
    Chat,
    CreateChatRequest,
    MessageResponseDTO,
    SendMessageRequest,
} from '@/types/interfaces/chat.interface';
import { axiosInstance } from '@/utils/axios-instance';
import { ListResponse, SingleResponse, PaginationResponse } from '@/utils/response-data';
import { handleAxiosError } from '../error.service';

// Get all conversations for the current user
export const getChats = async (): Promise<ListResponse<Chat>> => {
  try {
    const res = await axiosInstance.get('/conversations');
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Get messages for a conversation (with pagination)
export const getMessages = async (
  conversationId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginationResponse<MessageResponseDTO>> => {
  try {
    const res = await axiosInstance.get(`/conversations/${conversationId}/messages`, {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Create or get private conversation with another user
export const createOrGetPrivateChat = async (
  otherUserId: number
): Promise<SingleResponse<Chat>> => {
  try {
    const res = await axiosInstance.post(`/conversations/private/${otherUserId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Create group conversation
export const createGroupChat = async (
  title: string,
  memberIds: number[]
): Promise<SingleResponse<Chat>> => {
  try {
    const res = await axiosInstance.post('/conversations/group', {
      title,
      memberIds,
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Legacy function - maps to createOrGetPrivateChat
export const createChat = async (
  data: CreateChatRequest
): Promise<SingleResponse<Chat>> => {
  // If phone is provided, we need to find user by phone first
  // For now, assuming CreateChatRequest has userId or we need to search
  throw new Error('createChat needs to be updated to use createOrGetPrivateChat with userId');
};

// Get conversation by ID
export const getChat = async (chatId: string): Promise<SingleResponse<Chat>> => {
  try {
    const res = await axiosInstance.get(`/conversations/${chatId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Messages are sent via WebSocket, not REST API
// This function is kept for compatibility but should use WebSocket
export const sendMessage = async (
  data: SendMessageRequest
): Promise<SingleResponse<Message>> => {
  // Messages should be sent via WebSocket using StompProvider
  // See providers/StompProvider.tsx for sendMessage function
  throw new Error('sendMessage should use WebSocket, not REST API');
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId: string): Promise<SingleResponse<any>> => {
  try {
    const res = await axiosInstance.post(`/conversations/${conversationId}/mark-as-read`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Backend doesn't have delete conversation endpoint
export const deleteChat = async (chatId: string): Promise<SingleResponse<void>> => {
  throw new Error('DELETE /conversations/{id} endpoint not implemented in backend yet');
};

