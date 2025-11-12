import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '@/types/interfaces/chat.interface';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChatId: null,
  messages: {},
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      const existingIndex = state.chats.findIndex(
        (chat) => chat.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.chats[existingIndex] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }
    },
    setCurrentChat: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);

      // Update last message in chats list
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = message.fromMe
          ? `Bạn: ${message.text}`
          : message.text;
        chat.time = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    },
    updateChat: (
      state,
      action: PayloadAction<{ chatId: string; updates: Partial<Chat> }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        Object.assign(chat, action.payload.updates);
      }
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      delete state.messages[action.payload];
      if (state.currentChatId === action.payload) {
        state.currentChatId = null;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setChats,
  addChat,
  setCurrentChat,
  setMessages,
  addMessage,
  updateChat,
  deleteChat,
} = chatSlice.actions;
export default chatSlice.reducer;

