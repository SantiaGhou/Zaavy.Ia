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