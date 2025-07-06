import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import logRoutes from "./routes/logs";
import { WebSocketService } from "./services/websocketService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const server = createServer(app);
const wsService = WebSocketService.getInstance(server);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow WebSocket connections
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Make WebSocket service available to routes
app.locals.wsService = wsService;

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    connectedClients: wsService.getConnectedClientsCount(),
  });
});

// WebSocket status endpoint
app.get("/ws/status", (req, res) => {
  res.status(200).json({
    success: true,
    connectedClients: wsService.getConnectedClientsCount(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/logs", logRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Log API available at http://localhost:${PORT}/logs`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
