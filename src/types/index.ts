export interface Bot {
  id: string;
  name: string;
  prompt?: string;
  type: 'ai' | 'rules' | 'hybrid';
  flowData?: FlowData;
  status: 'online' | 'offline' | 'connecting';
  messagesCount: number;
  createdAt: Date;
  lastActivity?: Date;
  sessionId?: string;
  isConnected: boolean;
  
  // AI Configuration
  temperature: number;
  model: string;
  maxTokens: number;
  
  // Database fields
  updatedAt?: Date;
  userId?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'message' | 'condition' | 'ai' | 'action';
  position: { x: number; y: number };
  data: {
    label?: string;
    message?: string;
    conditions?: Condition[];
    aiPrompt?: string;
    responses?: string[];
  };
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Condition {
  id: string;
  type: 'contains' | 'equals' | 'starts_with' | 'ends_with';
  value: string;
  response: string;
  nextNode?: string;
}

export interface Message {
  id: string;
  botId: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  phoneNumber?: string;
  userName?: string;
  
  // AI Metadata
  tokensUsed?: number;
  model?: string;
  temperature?: number;
  
  // Database relations
  conversationId?: string;
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

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  content?: string;
  chunks?: string[];
  pageCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id: string;
  botId: string;
  phoneNumber: string;
  userName?: string;
  isActive: boolean;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Date;
  messages?: Message[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1k: number;
}

export interface BotState {
  stopped?: boolean;
  processing?: boolean;
}