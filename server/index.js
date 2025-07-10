const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import configurations and services
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { handleSocketConnection } = require('./sockets/socketHandlers');
const { cleanupAllBots } = require('./services/whatsappService');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
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
const getIO = () => ioInstance;

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

// Export for other modules
module.exports = { getIO };

// Start the server
startServer();