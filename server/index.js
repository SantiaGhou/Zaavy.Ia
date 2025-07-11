import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import configurations and services
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { handleSocketConnection } from './sockets/socketHandlers.js';
import { cleanupAllBots } from './services/whatsappService.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  handleSocketConnection(io, socket);
});

// Make IO available to other modules
let ioInstance = io;
export const getIO = () => ioInstance;

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    // Close all WhatsApp clients
    await cleanupAllBots();
    
    // Disconnect database
    await disconnectDatabase();
    
    // Close server
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log('\n🚀 ===== ZAAVY.IA SERVER STARTED =====');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`📱 WhatsApp bots ready to connect`);
      console.log(`🤖 OpenAI integration active`);
      console.log(`🗄️ SQLite database with Prisma ORM`);
      console.log('=====================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();