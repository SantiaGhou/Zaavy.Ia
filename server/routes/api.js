const express = require('express');
const router = express.Router();

// Import controllers
const sessionController = require('../controllers/sessionController');
const botController = require('../controllers/botController');
const messageController = require('../controllers/messageController');

// Import middleware
const { authenticateSession } = require('../middleware/auth');

// Session routes
router.post('/session', sessionController.createSession);
router.post('/session/openai-key', authenticateSession, sessionController.saveOpenAIKey);
router.get('/session/info', authenticateSession, sessionController.getSessionInfo);

// Bot routes
router.get('/bots', authenticateSession, botController.getBots);
router.post('/bots', authenticateSession, botController.createBot);
router.put('/bots/:botId', authenticateSession, botController.updateBot);
router.delete('/bots/:botId', authenticateSession, botController.deleteBot);

// Message routes
router.get('/messages/:botId', authenticateSession, messageController.getMessages);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'SQLite with Prisma'
  });
});

module.exports = router;