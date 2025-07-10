const { prisma } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all bots for session
const getBots = async (req, res) => {
  try {
    const bots = await prisma.bot.findMany({
      where: { sessionId: req.session.sessionId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse flowData for each bot
    const botsWithParsedFlow = bots.map(bot => ({
      ...bot,
      flowData: bot.flowData ? JSON.parse(bot.flowData) : null
    }));
    
    res.json(botsWithParsedFlow);
  } catch (error) {
    console.error('Error getting bots:', error);
    res.status(500).json({ error: 'Failed to get bots' });
  }
};

// Create new bot
const createBot = async (req, res) => {
  try {
    const { name, prompt, type = 'ai', flowData } = req.body;

    const bot = await prisma.bot.create({
      data: {
        sessionId: req.session.sessionId,
        name,
        prompt,
        type,
        flowData: flowData ? JSON.stringify(flowData) : null,
        whatsappSessionId: uuidv4()
      }
    });

    res.json(bot);
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
};

// Update bot
const updateBot = async (req, res) => {
  try {
    const { botId } = req.params;
    const updates = req.body;
    
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

    // Prepare update data
    const updateData = { ...updates };
    if (updates.flowData) {
      updateData.flowData = JSON.stringify(updates.flowData);
    }

    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: updateData
    });

    res.json(updatedBot);
  } catch (error) {
    console.error('Error updating bot:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
};

// Delete bot
const deleteBot = async (req, res) => {
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

    // Delete bot (cascade will handle messages and whatsapp sessions)
    await prisma.bot.delete({
      where: { id: botId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bot:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
};

module.exports = {
  getBots,
  createBot,
  updateBot,
  deleteBot
};