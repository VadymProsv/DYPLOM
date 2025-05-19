import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Event } from '@/types';

interface AdminState {
  users: {
    items: User[];
    total: number;
    hasMore: boolean;
  };
  events: {
    items: Event[];
    total: number;
    hasMore: boolean;
  };
  statistics: {
    totalUsers: number;
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalParticipants: number;
    categoryStats: {
      [key: string]: number;
    };
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: {
    items: [],
    total: 0,
    hasMore: false,
  },
  events: {
    items: [],
    total: 0,
    hasMore: false,
  },
  statistics: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setUsers: (
      state,
      action: PayloadAction<{
        users: User[];
        total: number;
        hasMore: boolean;
      }>
    ) => {
      state.users = {
        items: action.payload.users,
        total: action.payload.total,
        hasMore: action.payload.hasMore,
      };
      state.error = null;
    },
    appendUsers: (
      state,
      action: PayloadAction<{
        users: User[];
        total: number;
        hasMore: boolean;
      }>
    ) => {
      state.users = {
        items: [...state.users.items, ...action.payload.users],
        total: action.payload.total,
        hasMore: action.payload.hasMore,
      };
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.items.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users.items[index] = action.payload;
      }
      state.error = null;
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users.items = state.users.items.filter(
        (user) => user.id !== action.payload
      );
      state.users.total -= 1;
      state.error = null;
    },
    setEvents: (
      state,
      action: PayloadAction<{
        events: Event[];
        total: number;
        hasMore: boolean;
      }>
    ) => {
      state.events = {
        items: action.payload.events,
        total: action.payload.total,
        hasMore: action.payload.hasMore,
      };
      state.error = null;
    },
    appendEvents: (
      state,
      action: PayloadAction<{
        events: Event[];
        total: number;
        hasMore: boolean;
      }>
    ) => {
      state.events = {
        items: [...state.events.items, ...action.payload.events],
        total: action.payload.total,
        hasMore: action.payload.hasMore,
      };
      state.error = null;
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.items.findIndex(
        (event) => event.id === action.payload.id
      );
      if (index !== -1) {
        state.events.items[index] = action.payload;
      }
      state.error = null;
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events.items = state.events.items.filter(
        (event) => event.id !== action.payload
      );
      state.events.total -= 1;
      state.error = null;
    },
    setStatistics: (
      state,
      action: PayloadAction<{
        totalUsers: number;
        totalEvents: number;
        activeEvents: number;
        completedEvents: number;
        totalParticipants: number;
        categoryStats: {
          [key: string]: number;
        };
      } | null>
    ) => {
      console.log('REDUCER setStatistics', action.payload);
      state.statistics = action.payload || null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setUsers,
  appendUsers,
  updateUser,
  removeUser,
  setEvents,
  appendEvents,
  updateEvent,
  removeEvent,
  setStatistics,
  setLoading,
  setError,
} = adminSlice.actions;

export default adminSlice.reducer; 