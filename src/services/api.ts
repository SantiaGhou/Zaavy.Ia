import { io, Socket } from 'socket.io-client';

class ApiService {
  private socket: Socket | null = null;
  private baseUrl = 'http://localhost:3001';
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.baseUrl);
      
      // Authenticate socket connection
      const token = this.getToken();
      if (token) {
        this.socket.emit('authenticate', { token });
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

  async register(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async saveOpenAIKey(apiKey: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/openai-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
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

  async createBot(name: string, prompt: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ name, prompt }),
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

  async getBots() {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots`, {
        headers: this.getAuthHeaders(),
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

  async getMessages(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages/${botId}`, {
        headers: this.getAuthHeaders(),
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

  async deleteBot(botId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bots/${botId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
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

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  logout() {
    this.setToken(null);
    this.disconnect();
  }
}

export const apiService = new ApiService();