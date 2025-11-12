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
import { Message, SendMessageRequest } from '@/types/interfaces/chat.interface';
import { useEffect, useState } from 'react';
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
    let displayAvatar = conv.avatarUrl || 'https://via.placeholder.com/150';
    
    if (!isGroup && conv.members && Array.isArray(conv.members)) {
      // Find the other member (not current user)
      const otherMember = conv.members.find((m: any) => m.userId !== conv.creatorId);
      if (otherMember) {
        displayName = otherMember.userName || displayName;
        displayAvatar = otherMember.avatarUrl || displayAvatar;
      }
    }

    return {
      id: String(conv.id),
      name: displayName,
      lastMessage: 'Tin nhắn mới nhất', // TODO: Get from last message
      avatar: displayAvatar,
      phone: '', // Not available in backend response
      time: timeStr,
      unread: false, // TODO: Calculate from unread count
      isGroup: isGroup,
      members: conv.members ? conv.members.map((m: any) => String(m.userId)) : [],
    };
  }) : [];

  // Mock friend list for group creation UI (TODO: Replace with real API)
  const [friends] = useState(() => [
    { id: 'f1', name: 'Nguyễn Văn A', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', phone: '0912345678' },
    { id: 'f2', name: 'Trần Thị B', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', phone: '0987654321' },
    { id: 'f3', name: 'Lê C', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', phone: '0900111222' },
  ]);

  // Groups are subset of chats flagged isGroup
  const groups = chats.filter(c => c.isGroup);

  const markAsRead = (chatId: string) => {
    // TODO: Implement mark as read API call
    // For now, just update local state if needed
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read API call
  };

  // Create group function that calls the API
  const createGroup = (name: string, memberIds: string[], avatar: string) => {
    // Convert string IDs to numbers
    const numericMemberIds = memberIds.map(id => parseInt(id.replace('f', ''), 10)).filter(id => !isNaN(id));
    
    createGroupMutation.mutate(
      { title: name, memberIds: numericMemberIds, avatar },
      {
        onSuccess: (response) => {
          // Query will automatically refetch after mutation
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
        },
        onError: (error) => {
          console.error('Failed to create group:', error);
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
    friends, 
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
  });
};

// Get messages query
export const useMessages = (chatId: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: chatKeys.messages(chatId),
    queryFn: async () => {
      const response = await getMessages(chatId, page, size);
      // Backend returns APIResponse<Page<MessageResponse>>
      // response.data.items is PageData<MessageResponse>
      return response.data?.items?.content || [];
    },
    enabled: !!chatId,
    staleTime: 10 * 1000, // 10 seconds
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

