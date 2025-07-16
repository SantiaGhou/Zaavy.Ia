export interface Bot {
  id: string;
  name: string;
  description?: string;
  prompt?: string;
  type: 'rule-based' | 'ai' | 'hybrid';
  status: 'active' | 'inactive' | 'draft' | 'online' | 'offline' | 'connecting';
  flowData?: FlowData;
  settings?: BotSettings;
  messagesCount?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastActivity?: Date;
  sessionId?: string;
  isConnected?: boolean;
  // AI Configuration
  temperature?: number;
  model?: string;
  maxTokens?: number;
  // Database fields
  userId?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  connections?: FlowConnection[];
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
    triggerType?: 'message' | 'keyword' | 'time' | 'event';
    keywords?: string[];
    timeCondition?: {
      start: string;
      end: string;
      days: string[];
    };
    actionType?: 'forward' | 'webhook' | 'delay' | 'tag';
    actionConfig?: any;
    validation?: {
      isValid: boolean;
      errors: string[];
    };
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'smoothstep' | 'step';
  animated?: boolean;
  label?: string;
  data?: {
    condition?: 'true' | 'false' | 'default';
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
  type: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  response: string;
  nextNodeId?: string;
}

export interface BotSettings {
  welcomeMessage?: string;
  fallbackMessage?: string;
  workingHours?: {
    enabled: boolean;
    start: string;
    end: string;
    days: string[];
    outsideHoursMessage: string;
  };
  aiSettings?: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
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

export interface AppState {
  currentPage: 'dashboard' | 'bot-builder' | 'bot-session' | 'settings';
  currentBotId: string | null;
  bots: Bot[];
  user: {
    name: string;
    email: string;
    plan: 'free' | 'pro' | 'enterprise';
  };
}

export type AppAction =
  | { type: 'SET_CURRENT_PAGE'; payload: AppState['currentPage'] }
  | { type: 'SET_CURRENT_BOT'; payload: string | null }
  | { type: 'ADD_BOT'; payload: Bot }
  | { type: 'UPDATE_BOT'; payload: { id: string; updates: Partial<Bot> } }
  | { type: 'DELETE_BOT'; payload: string }
  | { type: 'SET_BOTS'; payload: Bot[] };