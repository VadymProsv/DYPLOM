import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const setUserFromToken = (token: string) => (dispatch: any) => {
  try {
    const decoded: any = jwtDecode(token);
    dispatch(setUser({
      id: decoded.userId || decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      // додайте інші поля, якщо потрібно
    }));
  } catch (error) {
    console.error('Error decoding token:', error);
  }
};

export const { setUser, setToken, setLoading, setError, logout } = authSlice.actions;

export default authSlice.reducer; 