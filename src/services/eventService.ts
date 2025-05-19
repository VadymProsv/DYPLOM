import axios from 'axios';
import { Event } from '@/types';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class EventService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getAllEvents(filters?: {
    search?: string;
    category?: string;
    date?: string;
    location?: string;
  }): Promise<Event[]> {
    const response = await axios.get(`${API_URL}/api/events`, {
      headers: this.getHeaders(),
      params: filters,
    });
    return response.data;
  }

  async getEventById(id: string): Promise<Event> {
    const response = await axios.get(`${API_URL}/api/events/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createEvent(eventData: FormData): Promise<Event> {
    const response = await axios.post(`${API_URL}/api/events`, eventData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateEvent(id: string, eventData: FormData): Promise<Event> {
    const response = await axios.put(`${API_URL}/api/events/${id}`, eventData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/events/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async registerForEvent(eventId: string): Promise<Event> {
    const response = await axios.post(
      `${API_URL}/api/events/${eventId}/register`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async unregisterFromEvent(eventId: string): Promise<Event> {
    const response = await axios.post(
      `${API_URL}/api/events/${eventId}/unregister`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async getEventParticipants(eventId: string): Promise<Event['participants']> {
    const response = await axios.get(`${API_URL}/api/events/${eventId}/participants`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

export const eventService = new EventService(); 