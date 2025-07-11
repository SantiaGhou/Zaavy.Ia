import { prisma } from '../config/database.js';
import { randomUUID } from 'crypto';

// Create new session
export const createSession = async (req, res) => {
  try {
    const sessionId = randomUUID();
    
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
export const saveOpenAIKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const sessionId = req.headers['x-session-id']; // pega a sessão do header

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID missing in request headers' });
    }

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid OpenAI API key format' });
    }

    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid OpenAI API key' });
    }

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
export const getSessionInfo = async (req, res) => {
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