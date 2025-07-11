import express from 'express';

// Import controllers
import { createSession, saveOpenAIKey, getSessionInfo } from '../controllers/sessionController.js';
import { getBots, createBot, updateBot, deleteBot } from '../controllers/botController.js';
import { getMessages } from '../controllers/messageController.js';

// Import middleware
import { authenticateSession } from '../middleware/auth.js';

const router = express.Router();

// Session routes
router.post('/session', createSession);
router.post('/session/openai-key', authenticateSession, saveOpenAIKey);
router.get('/session/info', authenticateSession, getSessionInfo);

// Bot routes
router.get('/bots', authenticateSession, getBots);
router.post('/bots', authenticateSession, createBot);
router.put('/bots/:botId', authenticateSession, updateBot);
router.delete('/bots/:botId', authenticateSession, deleteBot);

// Message routes
router.get('/messages/:botId', authenticateSession, getMessages);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'SQLite with Prisma'
  });
});

export default router;