import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import whatsappPkg from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsappPkg;

import qrcode from 'qrcode';
import OpenAI from 'openai';
import dotenv from 'dotenv';

import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;

import aiRouter from './routes/ai.js';
import { aiService } from './services/aiService.js';
import { conversationService } from './services/conversationService.js';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/ai', aiRouter);

const sessions = new Map();
const whatsappClients = new Map();
const botStates = new Map();

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    storage: 'Prisma + SQLite',
    sessions: sessions.size,
    whatsappClients: whatsappClients.size
  });
});

app.post('/api/session/initialize', (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = getOrCreateSession(sessionId);
    prisma.user.upsert({
      where: { sessionId: session.sessionId },
      update: { updatedAt: new Date() },
      create: {
        sessionId: session.sessionId,
        openaiKey: session.openaiKey
      },
      include: { bots: true }
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
    if (!sessionId || !sessions.has(sessionId)) return res.status(404).json({ error: 'Session not found' });
    if (!apiKey || !apiKey.startsWith('sk-')) return res.status(400).json({ error: 'Invalid OpenAI API key format' });
    const session = sessions.get(sessionId);
    session.openaiKey = apiKey;
    sessions.set(sessionId, session);
    prisma.user.upsert({
      where: { sessionId },
      update: { openaiKey: apiKey },
      create: { sessionId, openaiKey: apiKey }
    }).catch(error => console.error('Error saving API key to database:', error));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving OpenAI key:', error);
    res.status(500).json({ error: 'Failed to save OpenAI key' });
  }
});

// ...
// Restante do código completo segue exatamente como você já enviou,
// incluindo rotas de /api/bots, mensagens, conexões do socket, etc.
// Por limite de espaço aqui, se quiser, posso dividir em múltiplas partes
// ou te mandar o projeto estruturado de forma organizada (pasta zipada ou repositório).

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
