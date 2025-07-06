import { useEffect, useRef, useState } from "react";
import { WebSocketService } from "../services/websocketService";
import type { LogEntry } from "../types";
import type {
  ConnectionState,
  LogStats,
  SystemNotification,
  WebSocketEvents,
} from "../types/websocket";

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: ConnectionState;
  newLogNotification: LogEntry | null;
  systemNotification: SystemNotification | null;
  reconnect: () => void;
  clearNewLogNotification: () => void;
  clearSystemNotification: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [newLogNotification, setNewLogNotification] = useState<LogEntry | null>(
    null
  );
  const [systemNotification, setSystemNotification] =
    useState<SystemNotification | null>(null);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    const events: WebSocketEvents = {
      onNewLog: (log: LogEntry) => {
        setNewLogNotification(log);
        // Clear notification after 3 seconds
        setTimeout(() => setNewLogNotification(null), 3000);
      },
      onLogStats: (stats: LogStats) => {
        // Could trigger a callback or update global state
        console.log("Log stats updated:", stats);
      },
      onSystemNotification: (notification: SystemNotification) => {
        setSystemNotification(notification);
        // Clear notification after 5 seconds
        setTimeout(() => setSystemNotification(null), 5000);
      },
      onConnectionStatus: (connected: boolean) => {
        setIsConnected(connected);
        setConnectionState(connected ? "connected" : "disconnected");
      },
    };

    wsServiceRef.current = new WebSocketService(events);
    wsServiceRef.current.connect();

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      wsServiceRef.current?.ping();
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      wsServiceRef.current?.disconnect();
    };
  }, []);

  const reconnect = (): void => {
    wsServiceRef.current?.disconnect();
    setTimeout(() => {
      wsServiceRef.current?.connect();
    }, 1000);
  };

  const clearNewLogNotification = (): void => {
    setNewLogNotification(null);
  };

  const clearSystemNotification = (): void => {
    setSystemNotification(null);
  };

  return {
    isConnected,
    connectionState,
    newLogNotification,
    systemNotification,
    reconnect,
    clearNewLogNotification,
    clearSystemNotification,
  };
}
