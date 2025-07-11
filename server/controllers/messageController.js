import { prisma } from '../config/database.js';

// Get messages for a bot
export const getMessages = async (req, res) => {
  try {
    const { botId } = req.params;
    
    // Verify bot belongs to session
    const bot = await prisma.bot.findFirst({
      where: { 
        id: botId, 
        sessionId: req.session.sessionId 
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
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Create message
export const createMessage = async (botId, messageData) => {
  try {
    const message = await prisma.message.create({
      data: {
        botId,
        ...messageData
      }
    });

    // Update bot message count and last activity
    await prisma.bot.update({
      where: { id: botId },
      data: {
        messagesCount: { increment: 1 },
        lastActivity: new Date()
      }
    });

    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};