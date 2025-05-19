import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Event } from '@/types';

interface ProfileState {
  user: User | null;
  events: {
    organizing: Event[];
    participating: Event[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  events: {
    organizing: [],
    participating: [],
  },
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    setEvents: (
      state,
      action: PayloadAction<{
        organizing: Event[];
        participating: Event[];
      }>
    ) => {
      state.events = action.payload;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      state.error = null;
    },
    clearProfile: (state) => {
      state.user = null;
      state.events = {
        organizing: [],
        participating: [],
      };
      state.error = null;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setUser,
  setEvents,
  updateUser,
  clearProfile,
  setLoading,
  setError,
} = profileSlice.actions;

export default profileSlice.reducer; 