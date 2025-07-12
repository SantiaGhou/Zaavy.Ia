import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
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

// In-memory storage
const sessions = new Map();
const bots = new Map();
const messages = new Map();
const whatsappClients = new Map();
const openaiInstances = new Map();

// Utility functions
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateBotId = () => `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Session management middleware
const getOrCreateSession = (sessionId) => {
  if (!sessionId || !sessions.has(sessionId)) {
    const newSessionId = generateSessionId();
    const sessionData = {
      sessionId: newSessionId,
      openaiKey: null,
      createdAt: new Date(),
      bots: [],
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
    storage: 'In-memory',
    sessions: sessions.size,
    bots: bots.size,
    whatsappClients: whatsappClients.size
  });
});

// Session endpoints
app.post('/api/session/initialize', (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = getOrCreateSession(sessionId);
    
    res.json({
      sessionId: session.sessionId,
      hasOpenAIKey: !!session.openaiKey,
      botsCount: session.bots.length,
      createdAt: session.createdAt
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
    
    // Create OpenAI instance for this session
    openaiInstances.set(sessionId, new OpenAI({ apiKey }));
    
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
    
    const session = sessions.get(sessionId);
    res.json(session.bots);
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
});

app.post('/api/bots', (req, res) => {
  try {
    const { sessionId, name, prompt, type = 'ai', flowData } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessions.get(sessionId);
    const bot = {
      id: generateBotId(),
      sessionId,
      name,
      prompt,
      type,
      flowData: flowData || { nodes: [], connections: [] },
      status: 'offline',
      isConnected: false,
      messagesCount: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    session.bots.push(bot);
    sessions.set(sessionId, session);
    bots.set(bot.id, bot);
    
    res.json(bot);
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
    
    const session = sessions.get(sessionId);
    const botIndex = session.bots.findIndex(b => b.id === botId);
    
    if (botIndex === -1) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    const updatedBot = { ...session.bots[botIndex], ...updates, lastActivity: new Date() };
    session.bots[botIndex] = updatedBot;
    sessions.set(sessionId, session);
    bots.set(botId, updatedBot);
    
    res.json(updatedBot);
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
    
    const session = sessions.get(sessionId);
    session.bots = session.bots.filter(b => b.id !== botId);
    sessions.set(sessionId, session);
    bots.delete(botId);
    
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
    
    // Cleanup messages
    messages.delete(botId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bot:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});

// Messages endpoints
app.get('/api/messages/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    const botMessages = messages.get(botId) || [];
    res.json(botMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
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
      
      const bot = bots.get(botId);
      const session = sessions.get(socket.sessionId);
      
      if (!bot || !session) {
        socket.emit('bot-error', { botId, error: 'Bot or session not found' });
        return;
      }

      if (bot.type === 'ai' && !session.openaiKey) {
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
        bot.status = 'online';
        bot.isConnected = true;
        bot.lastActivity = new Date();
        bots.set(botId, bot);
        
        // Update session
        const session = sessions.get(socket.sessionId);
        if (session) {
          const botIndex = session.bots.findIndex(b => b.id === botId);
          if (botIndex !== -1) {
            session.bots[botIndex] = bot;
            sessions.set(socket.sessionId, session);
          }
        }
        
        socket.emit('bot-ready', {
          botId,
          status: 'online'
        });
      });

      client.on('message', async (message) => {
        if (message.from !== 'status@broadcast') {
          await handleMessage(message, bot, session, socket);
        }
      });

      client.on('disconnected', (reason) => {
        console.log(`❌ Bot ${botId} disconnected:`, reason);
        
        bot.status = 'offline';
        bot.isConnected = false;
        bots.set(botId, bot);
        
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
      
      const bot = bots.get(botId);
      if (bot) {
        bot.status = 'offline';
        bot.isConnected = false;
        bots.set(botId, bot);
      }
      
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
async function handleMessage(message, bot, session, socket) {
  try {
    const messageData = {
      id: generateMessageId(),
      botId: bot.id,
      content: message.body,
      sender: 'user',
      phoneNumber: message.from,
      userName: message._data.notifyName || 'Unknown',
      timestamp: new Date()
    };

    // Save message
    if (!messages.has(bot.id)) {
      messages.set(bot.id, []);
    }
    messages.get(bot.id).push(messageData);

    // Update bot message count
    bot.messagesCount++;
    bot.lastActivity = new Date();
    bots.set(bot.id, bot);

    // Emit to frontend
    socket.emit('new-message', messageData);

    // Generate response
    let response = null;
    
    if (bot.type === 'ai') {
      response = await generateAIResponse(message.body, bot.prompt, session.openaiKey);
    } else if (bot.type === 'rules' || bot.type === 'hybrid') {
      response = await processRulesFlow(message.body, bot, session.openaiKey);
    }
    
    if (response) {
      // Send response via WhatsApp
      await message.reply(response);

      // Save bot response
      const botMessageData = {
        id: generateMessageId(),
        botId: bot.id,
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };

      messages.get(bot.id).push(botMessageData);
      socket.emit('new-message', botMessageData);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

async function generateAIResponse(userMessage, prompt, apiKey) {
  try {
    if (!apiKey) {
      return "Erro: Chave da OpenAI não configurada.";
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt || "Você é um assistente útil e amigável."
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
      return "Erro: Chave da OpenAI inválida.";
    }
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}

async function processRulesFlow(userMessage, bot, apiKey) {
  try {
    if (!bot.flowData || !bot.flowData.nodes) {
      return "Bot não configurado.";
    }

    const { nodes } = bot.flowData;

    // Find condition nodes and check matches
    for (const node of nodes) {
      if (node.type === 'condition' && node.data.conditions) {
        for (const condition of node.data.conditions) {
          if (checkCondition(userMessage, condition)) {
            return condition.response;
          }
        }
      }
    }

    // If hybrid bot and no rule matches, try AI
    if (bot.type === 'hybrid') {
      const aiNode = nodes.find(node => node.type === 'ai');
      if (aiNode && apiKey) {
        return await generateAIResponse(userMessage, aiNode.data.aiPrompt, apiKey);
      }
    }

    return "Desculpe, não entendi sua mensagem. Pode reformular?";
  } catch (error) {
    console.error('Error processing rules flow:', error);
    return "Erro ao processar sua mensagem.";
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
  bots.clear();
  messages.clear();
  openaiInstances.clear();
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