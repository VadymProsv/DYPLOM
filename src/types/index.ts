export type UserRole = 'visitor' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'military' | 'medical' | 'humanitarian' | 'educational';
  status: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
  startDate: string;
  endDate: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  attachments?: {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event' | 'chat' | 'system';
  read: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
} 