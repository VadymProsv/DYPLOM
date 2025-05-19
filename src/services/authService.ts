import axios from 'axios';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData extends SignInData {
  name: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', { 
        email,
        hasPassword: !!password,
        passwordLength: password?.length
      });
      
      if (!email || !password) {
        console.log('Missing required fields:', { 
          hasEmail: !!email,
          hasPassword: !!password 
        });
        throw { message: 'Email and password are required' };
      }

      const loginData = {
        email,
        password,
      };
      
      console.log('Sending login request to:', `${API_URL}/api/auth/login`);
      console.log('Request data:', { ...loginData, password: '[REDACTED]' });

      const response = await axios.post(`${API_URL}/api/auth/login`, loginData);
      
      console.log('Login response:', { 
        success: true,
        user: response.data.user,
        hasToken: !!response.data.token 
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : null
        }
      });
      
      if (error.response?.status === 401) {
        throw { message: 'Invalid email or password' };
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Invalid input data';
        console.log('Server error message:', errorMessage);
        
        if (errorMessage.includes('email')) {
          throw { message: 'Invalid email format' };
        } else if (errorMessage.includes('password')) {
          throw { message: 'Password is required' };
        } else {
          throw { message: errorMessage };
        }
      } else {
        throw { message: 'An error occurred during login' };
      }
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with:', { 
        name: data.name, 
        email: data.email,
        hasPassword: !!data.password,
        passwordLength: data.password?.length
      });
      
      if (!data.name || !data.email || !data.password) {
        throw { message: 'All fields are required' };
      }

      console.log('Sending registration request to:', `${API_URL}/api/auth/register`);
      console.log('Request data:', { 
        name: data.name, 
        email: data.email,
        password: '[REDACTED]'
      });

      const response = await axios.post(`${API_URL}/api/auth/register`, data);
      
      console.log('Registration response:', { 
        success: true,
        user: response.data.user,
        hasToken: !!response.data.token 
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : null
        }
      });
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Invalid input data';
        console.log('Server error message:', errorMessage);
        
        if (errorMessage.includes('email')) {
          throw { message: 'Email is already in use' };
        } else if (errorMessage.includes('password')) {
          throw { message: 'Password is too weak' };
        } else {
          throw { message: errorMessage };
        }
      } else {
        throw { message: 'An error occurred during registration' };
      }
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService(); 