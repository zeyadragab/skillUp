import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/database.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

// Load .env relative to this file, not the CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

// Initialize Express app
const app = express();

// Connect to both databases before mounting routes
await connectDB();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.ADMIN_FRONTEND_URL || "http://localhost:5174",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// API Routes
app.use("/api/admin", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "skillup Admin API Server",
    version: "1.0.0",
    documentation: "/api/admin/health",
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                          ║");
  console.log("║   🔐 skillup Admin API Server                          ║");
  console.log("║                                                          ║");
  console.log(`║   🚀 Server running on port ${PORT}                        ║`);
  console.log(
    `║   📍 Environment: ${process.env.NODE_ENV || "development"}                      ║`,
  );
  console.log("║                                                          ║");
  console.log("║   📌 Endpoints:                                          ║");
  console.log("║      • Auth:          /api/admin/auth                    ║");
  console.log("║      • Dashboard:     /api/admin/dashboard               ║");
  console.log("║      • Users:         /api/admin/users                   ║");
  console.log("║      • Teachers:      /api/admin/teachers                ║");
  console.log("║      • Skills:        /api/admin/skills                  ║");
  console.log("║      • Sessions:      /api/admin/sessions                ║");
  console.log("║      • Transactions:  /api/admin/transactions            ║");
  console.log("║      • Reports:       /api/admin/reports                 ║");
  console.log("║      • Reviews:       /api/admin/reviews                 ║");
  console.log("║      • Notifications: /api/admin/notifications           ║");
  console.log("║      • Settings:      /api/admin/settings                ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
});

const shutdown = (err) => {
  if (err) console.error("❌ Fatal:", err.message);
  server.close(() => process.exit(err ? 1 : 0));
  setTimeout(() => process.exit(1), 3000).unref();
};

process.on("unhandledRejection", shutdown);
process.on("uncaughtException", shutdown);
process.on("SIGTERM", () => shutdown(null));
process.on("SIGINT", () => shutdown(null));

export default app;
