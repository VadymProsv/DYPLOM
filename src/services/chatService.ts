import axios from 'axios';
import { ChatMessage } from '@/types';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MESSAGES_PER_PAGE = 20;

class ChatService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getMessages(eventId: string, page: number = 1): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
  }> {
    const response = await axios.get(
      `${API_URL}/events/${eventId}/messages`,
      {
        headers: this.getHeaders(),
        params: {
          page,
          limit: MESSAGES_PER_PAGE,
        },
      }
    );
    return {
      messages: response.data.messages,
      hasMore: response.data.hasMore,
    };
  }

  async sendMessage(
    eventId: string,
    content: string,
    attachments?: File[]
  ): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('eventId', eventId);

    if (attachments) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await axios.post(
      `${API_URL}/events/${eventId}/messages`,
      formData,
      {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteMessage(eventId: string, messageId: string): Promise<void> {
    await axios.delete(
      `${API_URL}/events/${eventId}/messages/${messageId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  async editMessage(
    eventId: string,
    messageId: string,
    content: string
  ): Promise<ChatMessage> {
    const response = await axios.put(
      `${API_URL}/events/${eventId}/messages/${messageId}`,
      { content },
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }
}

export const chatService = new ChatService(); 