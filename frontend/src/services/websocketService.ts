import { io, Socket } from "socket.io-client";
import type {
  ConnectedMessage,
  ConnectionState,
  NewLogMessage,
  PongMessage,
  StatsUpdateMessage,
  SystemNotification,
  WebSocketEvents,
} from "../types/websocket";

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private isConnecting = false;
  private readonly events: WebSocketEvents;

  constructor(events: WebSocketEvents) {
    this.events = events;
  }

  public connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const url = import.meta.env.VITE_API_URL || "http://localhost:3001";

    this.socket = io(url, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.events.onConnectionStatus(true);

      // Subscribe to log updates
      this.socket?.emit("subscribe_logs");
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("WebSocket disconnected:", reason);
      this.isConnecting = false;
      this.events.onConnectionStatus(false);

      // Attempt to reconnect if not manually disconnected
      if (reason === "io server disconnect") {
        this.attemptReconnect();
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
      this.events.onConnectionStatus(false);
      this.attemptReconnect();
    });

    // Application events
    this.socket.on("new_log", (data: NewLogMessage) => {
      if (this.isValidNewLogMessage(data)) {
        this.events.onNewLog(data.data);
      }
    });

    this.socket.on("log_stats", (data: StatsUpdateMessage) => {
      if (this.isValidStatsUpdateMessage(data)) {
        this.events.onLogStats(data.data);
      }
    });

    this.socket.on("system_notification", (data: SystemNotification) => {
      if (this.isValidSystemNotification(data)) {
        this.events.onSystemNotification(data);
      }
    });

    this.socket.on("connected", (data: ConnectedMessage) => {
      console.log("Server welcome message:", data.message);
    });

    // Ping/pong for connection health
    this.socket.on("pong", (data: PongMessage) => {
      console.log("Pong received at:", data.timestamp);
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect();
      }
    }, delay);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.emit("unsubscribe_logs");
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  public ping(): void {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getConnectionState(): ConnectionState {
    if (this.isConnecting) return "connecting";
    if (this.socket?.connected) return "connected";
    return "disconnected";
  }

  // Type guards for runtime validation
  private isValidNewLogMessage(data: unknown): data is NewLogMessage {
    return (
      typeof data === "object" &&
      data !== null &&
      "type" in data &&
      "data" in data &&
      (data as NewLogMessage).type === "LOG_CREATED" &&
      typeof (data as NewLogMessage).data === "object"
    );
  }

  private isValidStatsUpdateMessage(data: unknown): data is StatsUpdateMessage {
    return (
      typeof data === "object" &&
      data !== null &&
      "type" in data &&
      "data" in data &&
      (data as StatsUpdateMessage).type === "STATS_UPDATE" &&
      typeof (data as StatsUpdateMessage).data === "object"
    );
  }

  private isValidSystemNotification(data: unknown): data is SystemNotification {
    return (
      typeof data === "object" &&
      data !== null &&
      "type" in data &&
      (data as SystemNotification).type === "SYSTEM_NOTIFICATION"
    );
  }
}
