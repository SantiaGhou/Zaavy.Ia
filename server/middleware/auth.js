import { prisma } from '../config/database.js';

// Simple session-based auth middleware
export const authenticateSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    // Find or create session
    let session = await prisma.session.findUnique({
      where: { sessionId }
    });

    if (!session) {
      session = await prisma.session.create({
        data: { sessionId }
      });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};