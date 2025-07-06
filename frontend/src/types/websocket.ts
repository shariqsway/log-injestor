import type { LogEntry } from "./index";

export interface LogStats {
  totalLogs: number;
  logsByLevel: {
    error: number;
    warn: number;
    info: number;
    debug: number;
  };
  averageLogsPerHour: number;
  lastUpdated: string;
}

export interface SystemNotification {
  type: "SYSTEM_NOTIFICATION";
  level: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
  id: string;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  data?: T;
  timestamp?: string;
  message?: string;
}

export interface NewLogMessage extends WebSocketMessage<LogEntry> {
  type: "LOG_CREATED";
  data: LogEntry;
}

export interface StatsUpdateMessage extends WebSocketMessage<LogStats> {
  type: "STATS_UPDATE";
  data: LogStats;
}

export interface PongMessage extends WebSocketMessage {
  timestamp: string;
}

export interface ConnectedMessage extends WebSocketMessage {
  message: string;
}

export type ConnectionState = "connecting" | "connected" | "disconnected";

export interface WebSocketEvents {
  onNewLog: (log: LogEntry) => void;
  onLogStats: (stats: LogStats) => void;
  onSystemNotification: (notification: SystemNotification) => void;
  onConnectionStatus: (connected: boolean) => void;
}
