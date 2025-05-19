import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface OrganizerRequest {
  id: string;
  userId: string;
  organizationName: string;
  phone: string;
  email: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

class OrganizerRequestService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getAllRequests(): Promise<OrganizerRequest[]> {
    const response = await axios.get(`${API_URL}/api/organizer-requests`, {
      headers: this.getHeaders(),
    });
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response.data.requests)) {
      return response.data.requests;
    } else {
      return [];
    }
  }

  async getRequestById(id: string): Promise<OrganizerRequest> {
    const response = await axios.get(`${API_URL}/api/organizer-requests/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async approveRequest(id: string): Promise<OrganizerRequest> {
    const response = await axios.put(`${API_URL}/api/organizer-requests/${id}/approve`, {}, {
      headers: this.getHeaders(),
    });
    return response.data.request;
  }

  async rejectRequest(id: string): Promise<OrganizerRequest> {
    const response = await axios.put(`${API_URL}/api/organizer-requests/${id}/reject`, {}, {
      headers: this.getHeaders(),
    });
    return response.data.request;
  }
}

export const organizerRequestService = new OrganizerRequestService(); 