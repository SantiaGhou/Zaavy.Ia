import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Bot, Message, User, Session, AuthUser } from '../types';

interface AppState {
  user: AuthUser | null;
  bots: Bot[];
  messages: Message[];
  sessions: Session[];
  isAuthenticated: boolean;
  token: string | null;
  currentPage: 'landing' | 'login' | 'dashboard' | 'create-bot' | 'bot-session' | 'saved-sessions';
  currentBotId: string | null;
  showApiKeyModal: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_CURRENT_PAGE'; payload: AppState['currentPage'] }
  | { type: 'SET_CURRENT_BOT'; payload: string | null }
  | { type: 'SET_SHOW_API_KEY_MODAL'; payload: boolean }
  | { type: 'ADD_BOT'; payload: Bot }
  | { type: 'UPDATE_BOT'; payload: { id: string; updates: Partial<Bot> } }
  | { type: 'DELETE_BOT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<Session> } };

const initialState: AppState = {
  user: null,
  bots: [],
  messages: [],
  sessions: [],
  isAuthenticated: false,
  token: null,
  currentPage: 'landing',
  currentBotId: null,
  showApiKeyModal: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_CURRENT_BOT':
      return { ...state, currentBotId: action.payload };
    case 'SET_SHOW_API_KEY_MODAL':
      return { ...state, showApiKeyModal: action.payload };
    case 'ADD_BOT':
      return { ...state, bots: [...state.bots, action.payload] };
    case 'UPDATE_BOT':
      return {
        ...state,
        bots: state.bots.map(bot =>
          bot.id === action.payload.id ? { ...bot, ...action.payload.updates } : bot
        ),
      };
    case 'DELETE_BOT':
      return {
        ...state,
        bots: state.bots.filter(bot => bot.id !== action.payload),
        messages: state.messages.filter(msg => msg.botId !== action.payload),
        sessions: state.sessions.filter(session => session.botId !== action.payload),
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id ? { ...session, ...action.payload.updates } : session
        ),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}