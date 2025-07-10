import { io, Socket } from 'socket.io-client';

class ApiService {
  private socket: Socket | null = null;
  private baseUrl = 'http://localhost:3001';
  private sessionId: string | null = null;

  // Session management
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem('sessionId');
    }
    return this.sessionId;
  }

  setSessionId(sessionId: string | null) {
    this.sessionId = sessionId;
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
    } else {
      localStorage.removeItem('sessionId');
    }
  }

  getSessionHeaders() {
    const sessionId = this.getSessionId();
    return sessionId ? { 'X-Session-ID': sessionId } : {};
  }

  // Create new session
  async createSession() {
    try {
      const response = await fetch(`${this.baseUrl}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      this.setSessionId(data.sessionId);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Get session info
  async getSessionInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/session/info`, {
        headers: this.getSessionHeaders(),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting session info:', error);
      throw error;
    }
  }

  // Socket connection
  connect() {
    if (!this.socket) {
      this.socket = io(this.baseUrl);
      
      // Authenticate socket connection
      const sessionId = this.getSessionId();
      if (sessionId) {
        this.socket.emit('authenticate', { sessionId });
      }
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // OpenAI API key
  async saveOpenAIKey(apiKey: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/session/openai-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getSessionHeaders(),
        },
        body: JSON.stringify({ apiKey }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      throw error;
    }
  }

  // Bot management
  async createBot(botData: { name: string; type: string; prompt?: string; flowData?: any }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getSessionHeaders(),
        },
        body: JSON.stringify(botData),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  }

  async updateBot(botId: string, updates: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getSessionHeaders(),
        },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating bot:', error);
      throw error;
    }
  }

  async getBots() {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots`, {
        headers: this.getSessionHeaders(),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching bots:', error);
      throw error;
    }
  }

  async deleteBot(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots/${botId}`, {
        method: 'DELETE',
        headers: this.getSessionHeaders(),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting bot:', error);
      throw error;
    }
  }

  // Messages
  async getMessages(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages/${botId}`, {
        headers: this.getSessionHeaders(),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  // Initialize session
  async initializeSession() {
    let sessionId = this.getSessionId();
    
    if (!sessionId) {
      const sessionData = await this.createSession();
      sessionId = sessionData.sessionId;
    }

    try {
      const sessionInfo = await this.getSessionInfo();
      return {
        sessionId,
        hasOpenAIKey: sessionInfo.hasOpenAIKey,
        botsCount: sessionInfo.botsCount
      };
    } catch (error) {
      // If session is invalid, create a new one
      const sessionData = await this.createSession();
      return {
        sessionId: sessionData.sessionId,
        hasOpenAIKey: false,
        botsCount: 0
      };
    }
  }

  // Clear session
  clearSession() {
    this.setSessionId(null);
    this.disconnect();
  }
}

export const apiService = new ApiService();