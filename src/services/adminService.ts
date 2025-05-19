import axios from 'axios';
import { User as UserType, Event } from '@/types';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AdminService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // Управління користувачами
  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: UserType[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: this.getHeaders(),
      params: { page, limit },
    });
    return response.data;
  }

  async updateUserRole(userId: string, role: 'user' | 'organizer' | 'admin'): Promise<UserType> {
    const response = await axios.put(
      `${API_URL}/api/users/${userId}/role`,
      { role },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async blockUser(userId: string): Promise<UserType> {
    const response = await axios.put(
      `${API_URL}/api/users/${userId}/block`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data.user;
  }

  async unblockUser(userId: string): Promise<UserType> {
    const response = await axios.put(
      `${API_URL}/api/users/${userId}/unblock`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data.user;
  }

  // Управління подіями
  async getEvents(page: number = 1, limit: number = 10): Promise<{
    events: Event[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await axios.get(`${API_URL}/api/events`, {
      headers: this.getHeaders(),
      params: { page, limit },
    });
    return response.data;
  }

  async updateEventStatus(
    eventId: string,
    status: 'upcoming' | 'ongoing' | 'completed' | 'canceled'
  ): Promise<Event> {
    const response = await axios.put(
      `${API_URL}/api/events/${eventId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/events/${eventId}`, {
      headers: this.getHeaders(),
    });
  }

  // Статистика
  async getStatistics(): Promise<{
    totalUsers: number;
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalParticipants: number;
    categoryStats: {
      [key: string]: number;
    };
    eventDurations: number[];
    participantsPerEvent: number[];
    eventsByMonth: {
      [month: string]: number;
    };
    organizersCount: number;
    avgDuration: number;
    avgParticipants: number;
    avgFillRate: number;
    avgEventsPerUser: number;
  }> {
    const response = await axios.get(`${API_URL}/api/statistics`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

export const adminService = new AdminService(); 