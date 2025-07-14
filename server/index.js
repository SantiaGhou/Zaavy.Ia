import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import aiRouter from './routes/ai.js';
import { aiService } from './services/aiService.js';
import { conversationService } from './services/conversationService.js';
import { prisma } from './lib/prisma.js';

try {
  dotenv.config();
} catch (error) {
  console.warn('Warning: .env file not found, using default values');
}

const app = express();
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/ai', aiRouter);

// In-memory storage
const sessions = new Map();
const whatsappClients = new Map();
const botStates = new Map(); // For real-time bot control

// Utility functions
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Session management middleware
const getOrCreateSession = (sessionId) => {
  if (!sessionId || !sessions.has(sessionId)) {
    const newSessionId = generateSessionId();
    const sessionData = {
      sessionId: newSessionId,
      openaiKey: null,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    sessions.set(newSessionId, sessionData);
    return sessionData;
  }
  
  const session = sessions.get(sessionId);
  session.lastActivity = new Date();
  sessions.set(sessionId, session);
  return session;
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    storage: 'Prisma + SQLite',
    sessions: sessions.size,
    whatsappClients: whatsappClients.size
  });
});

// Session endpoints
app.post('/api/session/initialize', (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = getOrCreateSession(sessionId);
    
    // Get user from database or create
    prisma.user.upsert({
      where: { sessionId: session.sessionId },
      update: { updatedAt: new Date() },
      create: {
        sessionId: session.sessionId,
        openaiKey: session.openaiKey
      },
      include: {
        bots: true
      }
    }).then(user => {
      res.json({
        sessionId: session.sessionId,
        hasOpenAIKey: !!user.openaiKey,
        botsCount: user.bots.length,
        createdAt: session.createdAt
      });
    }).catch(error => {
      console.error('Database error:', error);
      res.json({
      sessionId: session.sessionId,
      hasOpenAIKey: !!session.openaiKey,
      botsCount: 0,
      createdAt: session.createdAt
    });
    });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize session' });
  }
});

app.post('/api/session/openai-key', (req, res) => {
  try {
    const { sessionId, apiKey } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid OpenAI API key format' });
    }
    
    const session = sessions.get(sessionId);
    session.openaiKey = apiKey;
    sessions.set(sessionId, session);
    
    // Update database
    prisma.user.upsert({
      where: { sessionId },
      update: { openaiKey: apiKey },
      create: { sessionId, openaiKey: apiKey }
    }).catch(error => {
      console.error('Error saving API key to database:', error);
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving OpenAI key:', error);
    res.status(500).json({ error: 'Failed to save OpenAI key' });
  }
});

// Bot management endpoints
app.get('/api/bots', (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    prisma.user.findUnique({
      where: { sessionId },
      include: {
        bots: {
          orderBy: { createdAt: 'desc' }
        }
      }
    }).then(user => {
      if (!user) {
        return res.json([]);
      }
      
      // Add real-time status from memory
      const botsWithStatus = user.bots.map(bot => ({
        ...bot,
        flowData: bot.flowData ? JSON.parse(bot.flowData) : null,
        isConnected: whatsappClients.has(bot.id),
        status: whatsappClients.has(bot.id) ? 'online' : 'offline'
      }));
      
      res.json(botsWithStatus);
    }).catch(error => {
      console.error('Error fetching bots:', error);
      res.status(500).json({ error: 'Failed to fetch bots' });
    });
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
});

app.post('/api/bots', (req, res) => {
  try {
    const { 
      sessionId, 
      name, 
      prompt, 
      type = 'ai', 
      flowData,
      temperature = 0.7,
      model = 'gpt-3.5-turbo',
      maxTokens = 500
    } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    prisma.user.findUnique({
      where: { sessionId }
    }).then(user => {
      if (!user) {
        throw new Error('User not found');
      }
      
      return prisma.bot.create({
        data: {
          userId: user.id,
          name,
          prompt,
          type,
          temperature,
          model,
          maxTokens,
          flowData: flowData ? JSON.stringify(flowData) : JSON.stringify({ nodes: [], connections: [] }),
          status: 'offline',
          isConnected: false,
          messagesCount: 0
        }
      });
    }).then(bot => {
      res.json({
        ...bot,
        flowData: JSON.parse(bot.flowData)
      });
    }).catch(error => {
      console.error('Error creating bot:', error);
      res.status(500).json({ error: 'Failed to create bot' });
    });
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

app.put('/api/bots/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    const { sessionId, ...updates } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Prepare updates for database
    const dbUpdates = { ...updates };
    if (dbUpdates.flowData) {
      dbUpdates.flowData = JSON.stringify(dbUpdates.flowData);
    }
    delete dbUpdates.isConnected; // Don't store in DB
    
    prisma.bot.update({
      where: { id: botId },
      data: {
        ...dbUpdates,
        updatedAt: new Date()
      }
    }).then(bot => {
      res.json({
        ...bot,
        flowData: JSON.parse(bot.flowData),
        isConnected: whatsappClients.has(bot.id)
      });
    }).catch(error => {
      console.error('Error updating bot:', error);
      res.status(500).json({ error: 'Failed to update bot' });
    });
  } catch (error) {
    console.error('Error updating bot:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
});

app.delete('/api/bots/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    const { sessionId } = req.query;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Cleanup WhatsApp client
    const client = whatsappClients.get(botId);
    if (client) {
      try {
        client.destroy();
      } catch (error) {
        console.error('Error destroying WhatsApp client:', error);
      }
      whatsappClients.delete(botId);
    }
    
    // Cleanup bot state
    botStates.delete(botId);
    
    // Delete from database (cascade will handle related records)
    prisma.bot.delete({
      where: { id: botId }
    }).then(() => {
      res.json({ success: true });
    }).catch(error => {
      console.error('Error deleting bot:', error);
      res.status(500).json({ error: 'Failed to delete bot' });
    });
  } catch (error) {
    console.error('Error deleting bot:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});

// Bot control endpoints
app.post('/api/bots/:botId/stop', (req, res) => {
  try {
    const { botId } = req.params;
    
    // Set bot state to stopped
    botStates.set(botId, { ...botStates.get(botId), stopped: true });
    
    // Disconnect WhatsApp client if connected
    const client = whatsappClients.get(botId);
    if (client) {
      client.destroy();
      whatsappClients.delete(botId);
    }
    
    // Update database
    prisma.bot.update({
      where: { id: botId },
      data: { 
        status: 'offline',
        isConnected: false 
      }
    }).catch(error => {
      console.error('Error updating bot status:', error);
    });
    
    res.json({ success: true, status: 'stopped' });
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

app.post('/api/bots/:botId/start', (req, res) => {
  try {
    const { botId } = req.params;
    
    // Remove stopped state
    botStates.set(botId, { ...botStates.get(botId), stopped: false });
    
    res.json({ success: true, status: 'starting' });
  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

// Messages endpoints
app.get('/api/messages/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    const { limit = 50 } = req.query;
    
    prisma.message.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        conversation: {
          select: {
            phoneNumber: true,
            userName: true
          }
        }
      }
    }).then(messages => {
      res.json(messages.reverse()); // Return in chronological order
    }).catch(error => {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Conversations endpoints
app.get('/api/conversations/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    
    conversationService.getAllConversations(botId)
      .then(conversations => res.json(conversations))
      .catch(error => {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
      });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/conversations/:botId/stats', (req, res) => {
  try {
    const { botId } = req.params;
    
    conversationService.getConversationStats(botId)
      .then(stats => res.json(stats))
      .catch(error => {
        console.error('Error fetching conversation stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
      });
  } catch (error) {
    console.error('Error fetching conversation stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('authenticate', (data) => {
    try {
      const { sessionId } = data;
      
      if (!sessionId || !sessions.has(sessionId)) {
        socket.emit('authenticated', { success: false, error: 'Invalid session' });
        return;
      }
      
      socket.sessionId = sessionId;
      socket.emit('authenticated', { success: true });
      console.log(`✅ Socket authenticated for session: ${sessionId}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  });

  socket.on('create-bot', async (data) => {
    try {
      if (!socket.sessionId) {
        socket.emit('bot-error', { error: 'Not authenticated' });
        return;
      }

      const { botId } = data;
      console.log(`🤖 Creating WhatsApp client for bot: ${botId}`);
      
      // Get bot from database
      const bot = await prisma.bot.findUnique({
        where: { id: botId },
        include: { user: true }
      });
      
      if (!bot) {
        socket.emit('bot-error', { botId, error: 'Bot or session not found' });
        return;
      }

      // Check if bot is stopped
      const botState = botStates.get(botId);
      if (botState?.stopped) {
        socket.emit('bot-error', { botId, error: 'Bot is stopped' });
        return;
      }

      if (bot.type === 'ai' && !bot.user.openaiKey) {
        socket.emit('bot-error', { botId, error: 'OpenAI key not configured' });
        return;
      }

      // Destroy existing client if any
      const existingClient = whatsappClients.get(botId);
      if (existingClient) {
        try {
          await existingClient.destroy();
        } catch (error) {
          console.log('Cleaned up existing client');
        }
      }
      
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: botId
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      });

      client.on('qr', async (qr) => {
        try {
          console.log(`📱 QR Code received for bot: ${botId}`);
          const qrCodeDataURL = await qrcode.toDataURL(qr, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          console.log(`📱 QR Code generated and sending to frontend for bot: ${botId}`);
          
          socket.emit('qr-code', {
            botId,
            qrCode: qrCodeDataURL
          });
        } catch (error) {
          console.error('Error generating QR code:', error);
          socket.emit('bot-error', { botId, error: 'Failed to generate QR code' });
        }
      });

      client.on('ready', () => {
        console.log(`✅ Bot ${botId} is ready!`);
        
        // Update bot status
        prisma.bot.update({
          where: { id: botId },
          data: {
            status: 'online',
            isConnected: true,
            lastActivity: new Date()
          }
        }).catch(error => {
          console.error('Error updating bot status:', error);
        });
        
        socket.emit('bot-ready', {
          botId,
          status: 'online'
        });
      });

      client.on('message', async (message) => {
        if (message.from !== 'status@broadcast') {
          await handleMessage(message, bot, socket);
        }
      });

      client.on('disconnected', (reason) => {
        console.log(`❌ Bot ${botId} disconnected:`, reason);
        
        prisma.bot.update({
          where: { id: botId },
          data: {
            status: 'offline',
            isConnected: false
          }
        }).catch(error => {
          console.error('Error updating bot status:', error);
        });
        
        socket.emit('bot-disconnected', { botId, reason });
      });

      client.on('auth_failure', (msg) => {
        console.error(`🔐 Auth failure for bot ${botId}:`, msg);
        socket.emit('bot-error', { botId, error: 'Authentication failed' });
      });

      // Store client before initializing
      whatsappClients.set(botId, client);
      
      console.log(`🔄 Initializing WhatsApp client for bot: ${botId}`);
      
      // Initialize client
      client.initialize().then(() => {
        console.log(`🔄 Client initialization started for bot: ${botId}`);
      }).catch((error) => {
        console.error(`❌ Failed to initialize client for bot ${botId}:`, error);
        socket.emit('bot-error', { botId, error: 'Failed to initialize WhatsApp client' });
      });
      
    } catch (error) {
      console.error('Error creating bot:', error);
      socket.emit('bot-error', { botId: data.botId, error: error.message });
    }
  });

  socket.on('disconnect-bot', (data) => {
    try {
      const { botId } = data;
      const client = whatsappClients.get(botId);
      
      if (client) {
        client.destroy();
        whatsappClients.delete(botId);
      }
      
      prisma.bot.update({
        where: { id: botId },
        data: {
          status: 'offline',
          isConnected: false
        }
      }).catch(error => {
        console.error('Error updating bot status:', error);
      });
      
      socket.emit('bot-disconnected', { botId });
    } catch (error) {
      console.error('Error disconnecting bot:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Message handling functions
async function handleMessage(message, bot, socket) {
  try {

    // Check if bot is stopped
    const botState = botStates.get(bot.id);
    if (botState?.stopped) {
      console.log(`Bot ${bot.id} is stopped, ignoring message`);
      return;
    }

    const phoneNumber = message.from;
    const userName = message._data.notifyName || 'Unknown';
    
    // Get or create conversation
    const conversation = await conversationService.getOrCreateConversation(
      bot.id, 
      phoneNumber, 
      userName
    );
    
    // Save user message
    const userMessage = await conversationService.saveMessage(
      conversation.id,
      bot.id,
      message.body,
      'user',
      { phoneNumber, userName }
    );

    // Emit to frontend
    socket.emit('new-message', {
      id: userMessage.id,
      botId: bot.id,
      content: userMessage.content,
      sender: 'user',
      phoneNumber,
      userName,
      timestamp: userMessage.createdAt
    });

    // Generate response
    let response = null;
    let aiMetadata = {};
    
    if (bot.type === 'ai') {
      const result = await generateAIResponse(message.body, bot, conversation);
      response = result.response;
      aiMetadata = {
        tokensUsed: result.tokensUsed,
        model: result.model,
        temperature: result.temperature
      };
    } else if (bot.type === 'rules' || bot.type === 'hybrid') {
      const result = await processRulesFlow(message.body, bot, conversation);
      response = result.response;
      aiMetadata = result.metadata || {};
    }
    
    if (response) {
      // Send response via WhatsApp
      await message.reply(response);

      // Save bot message
      const botMessage = await conversationService.saveMessage(
        conversation.id,
        bot.id,
        response,
        'bot',
        aiMetadata
      );

      socket.emit('new-message', {
        id: botMessage.id,
        botId: bot.id,
        content: response,
        sender: 'bot',
        timestamp: botMessage.createdAt
      });
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

async function generateAIResponse(userMessage, bot, conversation) {
  try {
    if (!bot.user.openaiKey) {
      throw new Error("Chave da OpenAI não configurada.");
    }


    // Get conversation history
    const conversationHistory = conversation.messages || [];
    
    // Search for relevant documents
    const result = await aiService.generateResponse(userMessage, {
      apiKey: bot.user.openaiKey,
      prompt: bot.prompt || "Você é um assistente útil e amigável.",
      model: bot.model,
      temperature: bot.temperature,
      maxTokens: bot.maxTokens,
      conversationHistory
    });

    return result;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      response: "Desculpe, ocorreu um erro ao processar sua mensagem.",
      tokensUsed: 0,
      model: bot.model,
      temperature: bot.temperature
    };
  }
}

async function processRulesFlow(userMessage, bot, conversation) {
  try {
    const flowData = bot.flowData ? JSON.parse(bot.flowData) : null;
    
    if (!flowData || !flowData.nodes) {
      return { response: "Bot não configurado." };
    }

    const { nodes } = flowData;

    // Find condition nodes and check matches
    for (const node of nodes) {
      if (node.type === 'condition' && node.data.conditions) {
        for (const condition of node.data.conditions) {
          if (checkCondition(userMessage, condition)) {
            return { response: condition.response };
          }
        }
      }
    }

    // If hybrid bot and no rule matches, try AI
    if (bot.type === 'hybrid' && bot.user.openaiKey) {
      const aiNode = nodes.find(node => node.type === 'ai');
      if (aiNode && bot.user.openaiKey) {
        const result = await aiService.generateResponse(userMessage, {
          apiKey: bot.user.openaiKey,
          prompt: aiNode.data.aiPrompt || bot.prompt,
          model: bot.model,
          temperature: bot.temperature,
          maxTokens: bot.maxTokens,
          conversationHistory: conversation.messages || []
        });
        return result;
      }
    }

    return { response: "Desculpe, não entendi sua mensagem. Pode reformular?" };
  } catch (error) {
    console.error('Error processing rules flow:', error);
    return { response: "Erro ao processar sua mensagem." };
  }
}

function checkCondition(message, condition) {
  const messageText = message.toLowerCase();
  const conditionValue = condition.value.toLowerCase();

  switch (condition.type) {
    case 'contains':
      return messageText.includes(conditionValue);
    case 'equals':
      return messageText === conditionValue;
    case 'starts_with':
      return messageText.startsWith(conditionValue);
    case 'ends_with':
      return messageText.endsWith(conditionValue);
    default:
      return false;
  }
}

// Cleanup function
const cleanup = async () => {
  console.log('🧹 Cleaning up resources...');
  
  // Close all WhatsApp clients
  for (const [botId, client] of whatsappClients) {
    try {
      await client.destroy();
      console.log(`✅ Destroyed client for bot: ${botId}`);
    } catch (error) {
      console.error(`❌ Error destroying client ${botId}:`, error);
    }
  }
  
  whatsappClients.clear();
  sessions.clear();
  botStates.clear();
  
  // Close Prisma connection
  await prisma.$disconnect();
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    await cleanup();
    
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
      console.log('⏰ Force exit after timeout');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('\n🚀 ===== ZAAVY.IA BACKEND STARTED =====');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📱 WhatsApp integration ready`);
  console.log(`🤖 OpenAI integration active`);
  console.log(`💾 In-memory storage active`);
  console.log(`🔌 Socket.IO ready for connections`);
  console.log('=====================================\n');
});