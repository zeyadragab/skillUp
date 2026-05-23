import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";
import { startSessionReminderJob } from "./jobs/sessionReminderJob.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { detectBadWords } from "./services/badWordService.js";
import ContentModeration from "./models/ContentModeration.js";
import User from "./models/User.js";

// Load env vars
dotenv.config();

// Initialize express
const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

// Socket.io setup for real-time messaging
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
); // Security headers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression()); // Compress responses
app.use(morgan("dev")); // HTTP request logger

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Track which userId this socket belongs to (set when they join their room)
  let connectedUserId = null;

  // Join user to their personal room and mark them online
  socket.on("join", async (userId) => {
    socket.join(userId);
    connectedUserId = userId;
    console.log(`User ${userId} joined their room`);
    try {
      await connectDB();
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch (err) {
      console.error("Failed to set user online:", err.message);
    }
  });

  // Explicit online event (alternative to join)
  socket.on("user:online", async (userId) => {
    connectedUserId = userId;
    try {
      await connectDB();
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch (err) {
      console.error("Failed to set user online:", err.message);
    }
  });

  // Join conversation room
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle new message
  socket.on("send-message", (data) => {
    io.to(data.conversationId).emit("new-message", data);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("user-typing", {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  // Video call events
  socket.on("call-user", (data) => {
    io.to(data.to).emit("incoming-call", {
      from: data.from,
      sessionId: data.sessionId,
      signal: data.signal,
    });
  });

  socket.on("accept-call", (data) => {
    io.to(data.to).emit("call-accepted", {
      signal: data.signal,
    });
  });

  // Session-specific chat events
  socket.on("join-session-chat", ({ sessionId, userId, userName }) => {
    socket.join("session-chat:" + sessionId);
    console.log(`User ${userName} joined session chat ${sessionId}`);
    socket.emit("session-chat-joined", {
      sessionId,
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
    socket
      .to("session-chat:" + sessionId)
      .emit("session-chat-user-joined", {
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    io.to("session-chat:" + sessionId).emit("session-chat-message", {
      id: "system-" + Date.now(),
      sessionId,
      message: `${userName} joined the chat`,
      userId: "system",
      userName: "System",
      isSystem: true,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on(
    "session-chat-message",
    async ({ sessionId, message, userId, userName }) => {
      const result = detectBadWords(message);

      if (result.hasBadWords) {
        // Notify only the sender — do NOT broadcast the original message
        socket.emit("bad-word-detected", {
          originalMessage: message,
          flaggedWords: result.flaggedWords,
          severity: result.severity,
          warning:
            "Your message contains inappropriate content and was not sent.",
        });

        // Persist to ContentModeration collection for admin review
        try {
          await ContentModeration.create({
            session: sessionId,
            user: userId,
            originalMessage: message,
            flaggedWords: result.flaggedWords,
            severity: result.severity,
          });
        } catch (err) {
          console.error("ContentModeration save error:", err.message);
        }

        // Broadcast the cleaned (asterisked) version so the conversation can continue
        io.to("session-chat:" + sessionId).emit("session-chat-message", {
          id: Date.now().toString(),
          sessionId,
          message: result.cleanedMessage,
          userId,
          userName,
          moderated: true,
          timestamp: new Date().toISOString(),
        });

        return;
      }

      // No bad words — broadcast normally
      io.to("session-chat:" + sessionId).emit("session-chat-message", {
        id: Date.now().toString(),
        sessionId,
        message,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    },
  );

  socket.on("leave-session-chat", ({ sessionId, userId, userName }) => {
    socket.leave("session-chat:" + sessionId);
    socket
      .to("session-chat:" + sessionId)
      .emit("session-chat-user-left", {
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
  });

  socket.on("get-session-participants", async ({ sessionId }) => {
    const roomSockets = await io.in("session-chat:" + sessionId).allSockets();
    socket.emit("session-participants-count", {
      sessionId,
      count: roomSockets.size,
    });
  });

  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    if (connectedUserId) {
      try {
        await connectDB();
        await User.findByIdAndUpdate(connectedUserId, { isOnline: false });
      } catch (err) {
        console.error("Failed to set user offline:", err.message);
      }
    }
  });
});

// Make io accessible in req object
app.set("io", io);

// Health check route (no DB needed)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "skillup API is running",
    timestamp: new Date().toISOString(),
  });
});

// Connect to DB before all API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/test", testRoutes);
app.use("/api/moderation", moderationRoutes);

// 404 + global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only when running locally (not on Vercel serverless)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`
🚀 skillup Server is running!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}
    `);
    startSessionReminderJob();
  });
}

// Handle unhandled promise rejections (don't exit on Vercel)
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (process.env.VERCEL !== "1") {
    httpServer.close(() => process.exit(1));
  }
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  httpServer.close(() => {
    console.log("💤 Process terminated");
  });
});

export default app;

// trigger restart
