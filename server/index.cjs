const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Active WhatsApp clients
const activeClients = new Map();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// WhatsApp Bot Management
class WhatsAppBot {
  constructor(botData, userOpenAIKey, socketId) {
    this.botData = botData;
    this.userOpenAIKey = userOpenAIKey;
    this.socketId = socketId;
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
  }

  async initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.botData.id
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', async (qr) => {
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        
        // Save QR to database
        await prisma.session.upsert({
          where: { botId: this.botData.id },
          update: { qrCode: this.qrCode, isActive: false },
          create: {
            botId: this.botData.id,
            qrCode: this.qrCode,
            isActive: false
          }
        });

        io.to(this.socketId).emit('qr-code', {
          botId: this.botData.id,
          qrCode: this.qrCode
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    this.client.on('ready', async () => {
      this.isReady = true;
      
      // Update bot status in database
      await prisma.bot.update({
        where: { id: this.botData.id },
        data: {
          status: 'online',
          isConnected: true,
          lastActivity: new Date()
        }
      });

      // Update session
      await prisma.session.upsert({
        where: { botId: this.botData.id },
        update: { isActive: true, connectedAt: new Date() },
        create: {
          botId: this.botData.id,
          isActive: true,
          connectedAt: new Date()
        }
      });

      io.to(this.socketId).emit('bot-ready', {
        botId: this.botData.id,
        status: 'online'
      });
      
      console.log(`Bot ${this.botData.name} is ready!`);
    });

    this.client.on('message', async (message) => {
      if (message.from !== 'status@broadcast') {
        await this.handleMessage(message);
      }
    });

    this.client.on('disconnected', async (reason) => {
      console.log(`Bot ${this.botData.name} disconnected:`, reason);
      this.isReady = false;
      
      // Update bot status
      await prisma.bot.update({
        where: { id: this.botData.id },
        data: {
          status: 'offline',
          isConnected: false
        }
      });

      // Update session
      await prisma.session.updateMany({
        where: { botId: this.botData.id },
        data: { isActive: false }
      });

      io.to(this.socketId).emit('bot-disconnected', {
        botId: this.botData.id,
        reason
      });
    });

    await this.client.initialize();
  }

  async handleMessage(message) {
    try {
      const messageData = {
        botId: this.botData.id,
        content: message.body,
        sender: 'user',
        phoneNumber: message.from,
        userName: message._data.notifyName || 'Unknown',
        timestamp: new Date()
      };

      // Save message to database
      const savedMessage = await prisma.message.create({
        data: messageData
      });

      // Update bot message count and last activity
      await prisma.bot.update({
        where: { id: this.botData.id },
        data: {
          messagesCount: { increment: 1 },
          lastActivity: new Date()
        }
      });

      // Update session last message
      await prisma.session.updateMany({
        where: { botId: this.botData.id },
        data: { lastMessage: new Date() }
      });

      // Emit to frontend
      io.to(this.socketId).emit('new-message', {
        ...messageData,
        id: savedMessage.id
      });

      // Generate AI response
      const aiResponse = await this.generateAIResponse(message.body);
      
      if (aiResponse) {
        // Send response via WhatsApp
        await message.reply(aiResponse);

        // Save bot response
        const botMessageData = {
          botId: this.botData.id,
          content: aiResponse,
          sender: 'bot',
          timestamp: new Date()
        };

        const savedBotMessage = await prisma.message.create({
          data: botMessageData
        });

        // Update message count
        await prisma.bot.update({
          where: { id: this.botData.id },
          data: {
            messagesCount: { increment: 1 },
            lastActivity: new Date()
          }
        });

        io.to(this.socketId).emit('new-message', {
          ...botMessageData,
          id: savedBotMessage.id
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async generateAIResponse(userMessage) {
    try {
      if (!this.userOpenAIKey) {
        return "Erro: Chave da OpenAI não configurada. Configure sua chave nas configurações.";
      }

      const openai = new OpenAI({
        apiKey: this.userOpenAIKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: this.botData.prompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.code === 'invalid_api_key') {
        return "Erro: Chave da OpenAI inválida. Verifique sua chave nas configurações.";
      }
      return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
    }
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

// REST API Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasOpenAIKey: !!user.openaiKey
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasOpenAIKey: !!user.openaiKey
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/openai-key', authenticateToken, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid OpenAI API key format' });
    }

    // Test the API key
    try {
      const openai = new OpenAI({ apiKey });
      await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid OpenAI API key' });
    }

    // Update user with API key
    await prisma.user.update({
      where: { id: req.user.id },
      data: { openaiKey: apiKey }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bots', authenticateToken, async (req, res) => {
  try {
    const bots = await prisma.bot.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bots', authenticateToken, async (req, res) => {
  try {
    const { name, prompt } = req.body;

    const bot = await prisma.bot.create({
      data: {
        userId: req.user.id,
        name,
        prompt,
        sessionId: uuidv4()
      }
    });

    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:botId', authenticateToken, async (req, res) => {
  try {
    const { botId } = req.params;
    
    // Verify bot belongs to user
    const bot = await prisma.bot.findFirst({
      where: { 
        id: botId, 
        userId: req.user.id 
      }
    });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const messages = await prisma.message.findMany({
      where: { botId },
      orderBy: { timestamp: 'asc' }
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bots/:botId', authenticateToken, async (req, res) => {
  try {
    const { botId } = req.params;
    
    // Verify bot belongs to user
    const bot = await prisma.bot.findFirst({
      where: { 
        id: botId, 
        userId: req.user.id 
      }
    });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Destroy WhatsApp client if active
    if (activeClients.has(botId)) {
      const client = activeClients.get(botId);
      await client.destroy();
      activeClients.delete(botId);
    }

    // Delete bot (cascade will handle messages and sessions)
    await prisma.bot.delete({
      where: { id: botId }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'SQLite with Prisma'
  });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (user) {
        socket.userId = user.id;
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { success: false });
      }
    } catch (error) {
      socket.emit('authenticated', { success: false });
    }
  });

  socket.on('create-bot', async (data) => {
    if (!socket.userId) {
      socket.emit('bot-error', { error: 'Not authenticated' });
      return;
    }

    try {
      const { botId } = data;
      
      // Get bot and user data
      const bot = await prisma.bot.findFirst({
        where: { 
          id: botId, 
          userId: socket.userId 
        }
      });
      
      const user = await prisma.user.findUnique({
        where: { id: socket.userId }
      });
      
      if (!bot || !user) {
        socket.emit('bot-error', { botId, error: 'Bot or user not found' });
        return;
      }

      if (!user.openaiKey) {
        socket.emit('bot-error', { botId, error: 'OpenAI key not configured' });
        return;
      }

      const whatsappBot = new WhatsAppBot(bot, user.openaiKey, socket.id);
      activeClients.set(botId, whatsappBot);
      
      await whatsappBot.initialize();
      
      socket.emit('bot-created', { botId, status: 'connecting' });
    } catch (error) {
      console.error('Error creating bot:', error);
      socket.emit('bot-error', { botId: data.botId, error: error.message });
    }
  });

  socket.on('disconnect-bot', async (data) => {
    const { botId } = data;
    const bot = activeClients.get(botId);
    
    if (bot) {
      await bot.destroy();
      activeClients.delete(botId);
      
      // Update database
      await prisma.bot.update({
        where: { id: botId },
        data: {
          status: 'offline',
          isConnected: false
        }
      });
      
      socket.emit('bot-disconnected', { botId });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  // Close all WhatsApp clients
  for (const [botId, client] of activeClients) {
    try {
      await client.destroy();
    } catch (error) {
      console.error(`Error destroying client ${botId}:`, error);
    }
  }
  
  // Disconnect Prisma
  await prisma.$disconnect();
  
  process.exit(0);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp bots ready to connect`);
  console.log(`🤖 OpenAI integration active`);
  console.log(`🗄️ SQLite database with Prisma ORM`);
});