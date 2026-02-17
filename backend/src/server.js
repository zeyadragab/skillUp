import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import recordingRoutes from './routes/recordingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { startSessionReminderJob } from './jobs/sessionReminderJob.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();
const httpServer = createServer(app);

// Socket.io setup for real-time messaging
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
})); // Security headers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // HTTP request logger

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('send-message', (data) => {
    io.to(data.conversationId).emit('new-message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Video call events
  socket.on('call-user', (data) => {
    io.to(data.to).emit('incoming-call', {
      from: data.from,
      sessionId: data.sessionId,
      signal: data.signal
    });
  });

  socket.on('accept-call', (data) => {
    io.to(data.to).emit('call-accepted', {
      signal: data.signal
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Make io accessible in req object
app.set('io', io);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillSwap API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/test', testRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server only when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`
🚀 SkillSwap Server is running!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}
    `);
    startSessionReminderJob();
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('💤 Process terminated');
  });
});

export default app;

// trigger restart
