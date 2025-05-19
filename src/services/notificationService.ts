import axios from 'axios';
import { Notification } from '@/types';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class NotificationService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getNotifications(page: number = 1, limit: number = 10): Promise<{
    notifications: Notification[];
    hasMore: boolean;
    unreadCount: number;
  }> {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: this.getHeaders(),
      params: { page, limit },
    });
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  async markAllAsRead(): Promise<void> {
    await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: this.getHeaders(),
    });
  }

  async deleteAllNotifications(): Promise<void> {
    await axios.delete(`${API_URL}/notifications`, {
      headers: this.getHeaders(),
    });
  }
}

export const notificationService = new NotificationService(); 