export interface Bot {
  id: string;
  name: string;
  prompt: string;
  status: 'online' | 'offline' | 'connecting';
  messagesCount: number;
  createdAt: Date;
  lastActivity?: Date;
  sessionId?: string;
  isConnected: boolean;
}

export interface Message {
  id: string;
  botId: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  phoneNumber?: string;
  userName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  hasOpenAIKey: boolean;
}

export interface Session {
  id: string;
  botId: string;
  qrCode?: string;
  isActive: boolean;
  connectedAt?: Date;
  lastMessage?: Date;
}