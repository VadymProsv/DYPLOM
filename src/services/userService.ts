import axios from 'axios';
import { User } from '@/types';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class UserService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getUserProfile(): Promise<User> {
    try {
      console.log('Sending request to get user profile');
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: this.getHeaders(),
      });
      console.log('Received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access');
        }
        if (error.response?.status === 404) {
          throw new Error('User profile not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to load profile');
      }
      throw error;
    }
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    avatar?: File;
  }): Promise<User> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await axios.put(`${API_URL}/api/users/profile`, formData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await axios.put(
      `${API_URL}/api/users/password`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }

  async deleteAccount(): Promise<void> {
    await axios.delete(`${API_URL}/api/users/profile`, {
      headers: this.getHeaders(),
    });
  }

  async getUserEvents(): Promise<{
    organizing: Event[];
    participating: Event[];
  }> {
    const response = await axios.get(`${API_URL}/api/users/events`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_URL}/api/users/avatar`, formData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.avatarUrl;
  }
}

export const userService = new UserService(); 