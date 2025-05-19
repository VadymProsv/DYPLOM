import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatState } from '@/types';

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
      state.error = null;
    },
    addMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = [...action.payload, ...state.messages];
      state.error = null;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages = [action.payload, ...state.messages];
    },
    updateMessage: (state, action: PayloadAction<ChatMessage>) => {
      const index = state.messages.findIndex(
        (message) => message.id === action.payload.id
      );
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(
        (message) => message.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.hasMore = true;
      state.page = 1;
    },
  },
});

export const {
  setMessages,
  addMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setLoading,
  setError,
  setHasMore,
  setPage,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer; 