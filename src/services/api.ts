import { io, Socket } from 'socket.io-client';

class ApiService {
  private socket: Socket | null = null;
  private baseUrl = 'http://localhost:3001';
  private sessionId: string | null = null;

  // Session management with cookies
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = this.getCookie('sessionId');
    }
    return this.sessionId;
  }

  setSessionId(sessionId: string | null) {
    this.sessionId = sessionId;
    if (sessionId) {
      this.setCookie('sessionId', sessionId, 30); // 30 days
    } else {
      this.deleteCookie('sessionId');
    }
  }

  // Cookie utilities
  private setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  // Session headers
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
        console.log('🔐 Authenticating socket with session:', sessionId);
        this.socket.emit('authenticate', { sessionId });
      } else {
        console.warn('⚠️ No session ID available for socket authentication');
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
      const sessionId = this.getSessionId();
      const response = await fetch(`${this.baseUrl}/api/session/openai-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, apiKey }),
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
      const sessionId = this.getSessionId();
      const response = await fetch(`${this.baseUrl}/api/bots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...botData, sessionId }),
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
      const sessionId = this.getSessionId();
      const response = await fetch(`${this.baseUrl}/api/bots/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updates, sessionId }),
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
      const sessionId = this.getSessionId();
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

  // Bot control
  async stopBot(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots/${botId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error stopping bot:', error);
      throw error;
    }
  }

  async startBot(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots/${botId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error starting bot:', error);
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

  // Documents
  async uploadDocument(file: File) {
    try {
      const sessionId = this.getSessionId();
      const formData = new FormData();
      formData.append('document', file);
      formData.append('sessionId', sessionId);

      const response = await fetch(`${this.baseUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocuments() {
    try {
      const sessionId = this.getSessionId();
      const response = await fetch(`${this.baseUrl}/api/documents?sessionId=${sessionId}`);
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string) {
    try {
      const sessionId = this.getSessionId();
      const response = await fetch(`${this.baseUrl}/api/documents/${documentId}?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // AI Configuration
  async getAIModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/models`);
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching AI models:', error);
      throw error;
    }
  }

  async validateOpenAIKey(apiKey: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/validate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
  }

  async testAI(config: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error testing AI:', error);
      throw error;
    }
  }

  // Conversations
  async getConversations(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/conversations/${botId}`, {
        headers: this.getSessionHeaders(),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getConversationStats(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/conversations/${botId}/stats`, {
        headers: this.getSessionHeaders(),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
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
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/session/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      this.setSessionId(data.sessionId);
      return {
        sessionId: data.sessionId,
        hasOpenAIKey: data.hasOpenAIKey,
        botsCount: data.botsCount
      };
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  // Clear session
  clearSession() {
    this.setSessionId(null);
    this.disconnect();
  }
}

export const apiService = new ApiService();