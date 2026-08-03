import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './utils/logger.js';

// Load config
dotenv.config();

// Connect to Database
connectDB();

const server = http.createServer(app);

// Setup WebSockets server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

// Socket.io Connection Event Handler
io.on('connection', (socket) => {
  logger.info(`🔌 Client connected to WebSockets: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Port Selection
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Export Socket.io instance to be imported by controllers/workers later
export { io };

// Start background worker listener process
import './workers/uploadWorker.js';
