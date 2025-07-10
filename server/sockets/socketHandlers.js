const { prisma } = require('../config/database');
const { createWhatsAppBot, destroyWhatsAppBot } = require('../services/whatsappService');

const handleSocketConnection = (io, socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Authenticate socket with session ID
  socket.on('authenticate', async (data) => {
    try {
      const { sessionId } = data;
      
      if (!sessionId) {
        socket.emit('authenticated', { success: false, error: 'Session ID required' });
        return;
      }

      const session = await prisma.session.findUnique({
        where: { sessionId }
      });
      
      if (session) {
        socket.sessionId = sessionId;
        socket.emit('authenticated', { success: true });
        console.log(`✅ Socket authenticated for session: ${sessionId}`);
      } else {
        socket.emit('authenticated', { success: false, error: 'Invalid session' });
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  });

  // Create WhatsApp bot
  socket.on('create-bot', async (data) => {
    if (!socket.sessionId) {
      socket.emit('bot-error', { error: 'Not authenticated' });
      return;
    }

    try {
      const { botId } = data;
      
      // Get bot and session data
      const bot = await prisma.bot.findFirst({
        where: { 
          id: botId, 
          sessionId: socket.sessionId 
        }
      });
      
      const session = await prisma.session.findUnique({
        where: { sessionId: socket.sessionId }
      });
      
      if (!bot || !session) {
        socket.emit('bot-error', { botId, error: 'Bot or session not found' });
        return;
      }

      if (bot.type === 'ai' && !session.openaiKey) {
        socket.emit('bot-error', { botId, error: 'OpenAI key not configured' });
        return;
      }

      await createWhatsAppBot(bot, session.openaiKey, socket.id);
      
      socket.emit('bot-created', { botId, status: 'connecting' });
      console.log(`🤖 Bot created: ${bot.name}`);
    } catch (error) {
      console.error('Error creating bot:', error);
      socket.emit('bot-error', { botId: data.botId, error: error.message });
    }
  });

  // Disconnect bot
  socket.on('disconnect-bot', async (data) => {
    try {
      const { botId } = data;
      
      await destroyWhatsAppBot(botId);
      
      // Update database
      await prisma.bot.update({
        where: { id: botId },
        data: {
          status: 'offline',
          isConnected: false
        }
      });
      
      socket.emit('bot-disconnected', { botId });
      console.log(`🔌 Bot disconnected: ${botId}`);
    } catch (error) {
      console.error('Error disconnecting bot:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
};

module.exports = {
  handleSocketConnection
};