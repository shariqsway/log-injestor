import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { LogEntry } from "../types";

export class WebSocketService {
  private io: SocketIOServer;
  private static instance: WebSocketService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupEventHandlers();
  }

  static getInstance(server?: HTTPServer): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Send welcome message
      socket.emit("connected", {
        message: "Connected to log ingestion system",
        timestamp: new Date().toISOString(),
      });

      // Handle client subscription to log updates
      socket.on("subscribe_logs", () => {
        socket.join("log_updates");
        console.log(`Client ${socket.id} subscribed to log updates`);
      });

      // Handle client unsubscription
      socket.on("unsubscribe_logs", () => {
        socket.leave("log_updates");
        console.log(`Client ${socket.id} unsubscribed from log updates`);
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });

      // Handle ping for connection health
      socket.on("ping", () => {
        socket.emit("pong", { timestamp: new Date().toISOString() });
      });
    });
  }

  // Broadcast new log to all connected clients
  broadcastNewLog(log: LogEntry): void {
    this.io.to("log_updates").emit("new_log", {
      type: "LOG_CREATED",
      data: log,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `Broadcasted new log to clients: ${log.level} - ${log.message}`
    );
  }

  // Broadcast log statistics update
  broadcastLogStats(stats: any): void {
    this.io.to("log_updates").emit("log_stats", {
      type: "STATS_UPDATE",
      data: stats,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.io.sockets.sockets.size;
  }

  // Send system notification to all clients
  broadcastSystemNotification(
    message: string,
    type: "info" | "warning" | "error" = "info"
  ): void {
    this.io.emit("system_notification", {
      type: "SYSTEM_NOTIFICATION",
      level: type,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
