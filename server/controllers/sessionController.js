const { prisma } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create new session
const createSession = async (req, res) => {
  try {
    const sessionId = uuidv4();
    
    const session = await prisma.session.create({
      data: { sessionId }
    });

    res.json({
      sessionId: session.sessionId,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

// Save OpenAI API key
const saveOpenAIKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const { sessionId } = req.session;

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid OpenAI API key format' });
    }

    // Test the API key
    const OpenAI = require('openai');
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

    // Update session with API key
    await prisma.session.update({
      where: { sessionId },
      data: { openaiKey: apiKey }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving OpenAI key:', error);
    res.status(500).json({ error: 'Failed to save OpenAI key' });
  }
};

// Get session info
const getSessionInfo = async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionId: req.session.sessionId },
      include: {
        bots: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      sessionId: session.sessionId,
      hasOpenAIKey: !!session.openaiKey,
      botsCount: session.bots.length,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    res.status(500).json({ error: 'Failed to get session info' });
  }
};

module.exports = {
  createSession,
  saveOpenAIKey,
  getSessionInfo
};