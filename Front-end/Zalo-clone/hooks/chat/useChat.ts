/**
 * Chat hooks
 * TanStack Query hooks for chat functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getChats,
  getChat,
  getMessages,
  sendMessage,
  createChat,
  deleteChat,
  createOrGetPrivateChat,
  createGroupChat,
} from '@/services/chat/chat.service';
import { MessageResponseDTO } from '@/types/interfaces/chat.interface';
import { useEffect } from 'react';
import { useProfileQuery } from '@/hooks/profile/useProfile';
import customAvatar from '@/utils/avatar';
import { notificationKeys } from '@/hooks/notifications/useNotifications';
import Toast from 'react-native-toast-message';
// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: (filters?: string) => [...chatKeys.lists(), { filters }] as const,
  details: () => [...chatKeys.all, 'detail'] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  messages: (chatId: string) => [...chatKeys.all, 'messages', chatId] as const,
};


export type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  avatar?: string;
  time?: string;
  phone?: string;
  unread?: boolean;
  isGroup?: boolean;
  members?: string[]; // friend ids
};

const initial: Conversation[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    lastMessage: 'Bạn: Hẹn gặp nhé!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    time: '15:30',
    phone: '0912345678',
    unread: true,
  },
  {
    id: '2',
    name: 'Trần Thị B',
    lastMessage: 'Ok bạn ơi!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    time: '13:25',
    phone: '0987654321',
    unread: false,
  },
];

// Get all chats query
export const useChatsQuery = () => {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: async () => {
      const response = await getChats();
      // Backend returns APIResponse<List<ConversationResponse>>
      // response.data is DataResponse<ConversationResponse[]> | null
      return response.data?.items || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export function useChats() {
  // Use TanStack Query to fetch conversations from API
  const { data: conversationsData, isLoading } = useChatsQuery();
  const createGroupMutation = useCreateGroupChat();
  const queryClient = useQueryClient();
  const { data: profile } = useProfileQuery();
  const currentUserId = profile?.id;

  // Transform backend ConversationResponse[] to front-end Conversation[]
  const chats: Conversation[] = conversationsData ? conversationsData.map((conv: any) => {
    // Map backend ConversationResponse to front-end Conversation
    const isGroup = conv.type === 'GROUP';
    const lastMessageAt = conv.lastMessageAt ? new Date(conv.lastMessageAt) : conv.createdAt ? new Date(conv.createdAt) : new Date();
    const timeDiff = Date.now() - lastMessageAt.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    let timeStr = 'Mới';
    if (days > 0) {
      timeStr = `${days} ngày`;
    } else if (hours > 0) {
      timeStr = `${hours} giờ`;
    } else {
      const minutes = Math.floor(timeDiff / (1000 * 60));
      if (minutes > 0) {
        timeStr = `${minutes} phút`;
      }
    }

    // For private chats, get the other user's name and avatar
    let displayName = conv.title || 'Chat';
    let displayAvatar = conv.avatarUrl || null;
    
    
    if (!isGroup && conv.members && Array.isArray(conv.members)) {
      // Find the other member (not current user)
      const otherMember = conv.members.find((m: any) => {
        // Use currentUserId if available, otherwise fallback to creatorId comparison
        if (currentUserId) {
          return m.userId !== currentUserId;
        }
        // Fallback: find member that is not the creator
        return conv.creatorId ? m.userId !== conv.creatorId : true;
      });
      if (otherMember) {
        displayName = otherMember.userName || displayName;
        displayAvatar = otherMember.avatarUrl || displayAvatar;
      }
    }

    // Format last message
    let lastMessageText = 'Chưa có tin nhắn';
    if (conv.lastMessage) {
      // Nếu là tin nhắn của current user, thêm "Bạn: "
      if (currentUserId && conv.lastMessageSenderId === currentUserId) {
        lastMessageText = `Bạn: ${conv.lastMessage}`;
      } else if (conv.lastMessageSenderName) {
        // Hiển thị tên người gửi cho cả nhóm và chat riêng tư
        lastMessageText = `${conv.lastMessageSenderName}: ${conv.lastMessage}`;
      } else {
        lastMessageText = conv.lastMessage;
      }
    }

    return {
      id: String(conv.id),
      name: displayName,
      lastMessage: lastMessageText,
      avatar: displayAvatar || customAvatar,
      phone: '', // Not available in backend response
      time: timeStr,
      unread: (conv.unreadCount || 0) > 0, // Sử dụng unreadCount từ backend
      unreadCount: conv.unreadCount || 0, // Thêm unreadCount vào Conversation
      isGroup: isGroup,
      members: conv.members ? conv.members.map((m: any) => String(m.userId)) : [],
    };
  }) : [];

  // Friends list is now provided by useContacts() hook in the component

  // Groups are subset of chats flagged isGroup
  const groups = chats.filter(c => c.isGroup);

  const markAsReadMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const { markConversationAsRead } = await import('@/services/chat/chat.service');
      return markConversationAsRead(chatId);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unseenCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(10) });
    },
  });

  const markAsRead = (chatId: string) => {
    markAsReadMutation.mutate(chatId);
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read API call
  };

  // Create group function that calls the API
  const createGroup = (name: string, memberIds: string[], avatar: string) => {
    // Convert string IDs to numbers (userId from Contact interface)
    const numericMemberIds = memberIds
      .map(id => {
        const numId = parseInt(id, 10);
        return isNaN(numId) ? null : numId;
      })
      .filter((id): id is number => id !== null);
    
    if (numericMemberIds.length === 0) {
      console.error('No valid member IDs provided');
      return;
    }
    
    createGroupMutation.mutate(
      { title: name, memberIds: numericMemberIds },
      {
        onSuccess: (response) => {
          // Query will automatically refetch after mutation
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Đã tạo nhóm thành công',
          });
        },
        onError: (error: any) => {
          console.error('Failed to create group:', error);
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: error?.message || 'Không thể tạo nhóm',
          });
        },
      }
    );
  };

  const unreadCount = chats.reduce((acc, c) => acc + (c.unread ? 1 : 0), 0);

  return { 
    chats, 
    markAsRead, 
    markAllAsRead, 
    unreadCount, 
    createGroup: createGroup as (name: string, memberIds: string[], avatar: string) => Conversation, 
    groups,
    isLoading,
  };
}


// Get single chat query
export const useChat = (chatId: string) => {
  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: async () => {
      const response = await getChat(chatId);
      // Backend returns APIResponse<ConversationResponse>
      // response.data is DataResponse<ConversationResponse> | null
      return response.data?.items;
    },
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000, // 5 minutes - chat details don't change often
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
};

// Get messages query
export const useMessages = (chatId: string, page: number = 0, size: number = 20) => {
  return useQuery<PaginationResponse<MessageResponseDTO>, Error, MessageResponseDTO[]>({
    queryKey: chatKeys.messages(chatId),
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds - messages are updated via WebSocket
    retry: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on mount if data exists (WebSocket handles updates)
    queryFn: async () => {
      const response = await getMessages(chatId, page, size);
      return response;
    },
    select: (response) => response.data?.items?.content || [],
  });
};

// // Send message mutation
// export const useSendMessage = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: sendMessage,
//     onSuccess: (response, variables) => {
//       // Invalidate messages query to refetch
//       queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) });
//       // Update chats list
//       queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
//     },
//     // Optimistic update
//     onMutate: async (newMessage) => {
//       // Cancel outgoing refetches
//       await queryClient.cancelQueries({ queryKey: chatKeys.messages(newMessage.chatId) });
      
//       // Snapshot previous value
//       const previousMessages = queryClient.getQueryData<Message[]>(
//         chatKeys.messages(newMessage.chatId)
//       );
      
//       // Optimistically update
//       const optimisticId = `temp-${Date.now()}`;
//       const optimisticMessage: Message & { queued?: boolean } = {
//         id: optimisticId,
//         text: newMessage.text,
//         fromMe: true,
//         timestamp: new Date().toISOString(),
//         chatId: newMessage.chatId,
//       };
      
//       queryClient.setQueryData<Message[]>(
//         chatKeys.messages(newMessage.chatId),
//         (old = []) => [...old, optimisticMessage]
//       );
      
//       return { previousMessages, optimisticId };
//     },
//     onError: async (err, newMessage, context: any) => {
//       // Instead of full rollback, persist the failed message and mark it as queued in cache
//       try {
//         const queued = await enqueueFailedMessagePersist(newMessage as SendMessageRequest);
//         // replace optimistic message with queued placeholder
//         queryClient.setQueryData<Message[]>(chatKeys.messages(newMessage.chatId), (old = []) => {
//           const found = old.find((m) => m.id === context?.optimisticId);
//           const queuedMsg: any = {
//             id: queued.tempId,
//             text: newMessage.text,
//             fromMe: true,
//             chatId: newMessage.chatId,
//             queued: true,
//             timestamp: new Date().toISOString(),
//           };
//           if (found) {
//             return old.map((m) => (m.id === context.optimisticId ? queuedMsg : m));
//           }
//           return [...old, queuedMsg];
//         });
//       } catch {
//         // fallback rollback if enqueue fails
//         if (context?.previousMessages) {
//           queryClient.setQueryData(chatKeys.messages(newMessage.chatId), context.previousMessages);
//         }
//       }
//     },
//   });
// };

// Create chat mutation (legacy - use createOrGetPrivateChat or createGroupChat instead)
export const useCreateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
};

// Create or get private chat mutation
export const useCreateOrGetPrivateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (otherUserId: number) => createOrGetPrivateChat(otherUserId),
    onSuccess: (response) => {
      // Backend returns APIResponse<ConversationResponse>
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      if (response.data?.items?.id) {
        queryClient.invalidateQueries({ queryKey: chatKeys.detail(String(response.data.items.id)) });
      }
    },
  });
};

// Create group chat mutation
export const useCreateGroupChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ title, memberIds, avatar }: { title: string; memberIds: number[]; avatar?: string }) => 
      createGroupChat(title, memberIds),
    onSuccess: (response) => {
      // Backend returns APIResponse<ConversationResponse>
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      if (response.data?.items?.id) {
        queryClient.invalidateQueries({ queryKey: chatKeys.detail(String(response.data.items.id)) });
      }
    },
  });
};

// Delete chat mutation
export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      queryClient.removeQueries({ queryKey: chatKeys.detail(chatId) });
      queryClient.removeQueries({ queryKey: chatKeys.messages(chatId) });
    },
  });
};

