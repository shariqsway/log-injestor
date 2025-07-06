import { Request, Response } from "express";
import { LogService } from "../services/logService";
import { WebSocketService } from "../services/websocketService";
import { FilterCriteria, LogEntryInput, LogQueryParams } from "../types";
import { StorageUtils } from "../utils/storageUtils";

export class LogController {
  private logService: LogService;

  constructor() {
    this.logService = new LogService();
  }

  // POST /logs - Create a new log entry with WebSocket broadcast
  async createLog(req: Request, res: Response): Promise<void> {
    try {
      const logData: LogEntryInput = req.body;
      const createdLog = await this.logService.addLog(logData);

      // Broadcast new log to WebSocket clients
      const wsService = req.app.locals.wsService as WebSocketService;
      if (wsService) {
        wsService.broadcastNewLog(createdLog);

        // Also broadcast updated stats
        const logsByLevel = await this.logService.getLogsByLevel();
        wsService.broadcastLogStats({
          logsByLevel,
          totalLogs: await this.logService.getLogCount(),
          latestLog: createdLog,
        });
      }

      res.status(201).json(createdLog);
    } catch (error) {
      console.error("Error creating log:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error occurred while processing the log entry",
      });
    }
  }

  // GET /logs - Retrieve log entries with optional filtering
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as LogQueryParams;
      const filters = this.buildFilterCriteria(queryParams);

      const logs = await this.logService.getLogs(filters);

      res.status(200).json(logs);
    } catch (error) {
      console.error("Error retrieving logs:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error occurred while retrieving logs",
      });
    }
  }

  // GET /logs/stats - Get log statistics
  async getLogStats(req: Request, res: Response): Promise<void> {
    try {
      const totalLogs = await this.logService.getLogCount();
      const logsByLevel = await this.logService.getLogsByLevel();
      const allLogs = await this.logService.getAllLogs();

      // Calculate recent activity (last 24 hours)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogs = allLogs.filter(
        (log) => new Date(log.timestamp) > last24Hours
      );

      res.status(200).json({
        success: true,
        data: {
          totalLogs,
          logsByLevel,
          recentActivity: {
            last24Hours: recentLogs.length,
            errorRate:
              totalLogs > 0
                ? (((logsByLevel.error || 0) / totalLogs) * 100).toFixed(2)
                : 0,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error getting log stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get log statistics",
      });
    }
  }

  // GET /logs/debug - Debug endpoint for troubleshooting
  async getDebugInfo(req: Request, res: Response): Promise<void> {
    try {
      const storageInfo = await StorageUtils.getStorageInfo();
      const isValid = await StorageUtils.validateStorage();
      const wsService = req.app.locals.wsService as WebSocketService;

      res.status(200).json({
        success: true,
        debug: {
          storage: storageInfo,
          isValid,
          webSocket: {
            connectedClients: wsService
              ? wsService.getConnectedClientsCount()
              : 0,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error getting debug info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get debug information",
      });
    }
  }

  // POST /logs/reset - Reset storage (for debugging)
  async resetStorage(req: Request, res: Response): Promise<void> {
    try {
      await StorageUtils.resetStorage();

      // Notify WebSocket clients about storage reset
      const wsService = req.app.locals.wsService as WebSocketService;
      if (wsService) {
        wsService.broadcastSystemNotification("Storage has been reset", "info");
        wsService.broadcastLogStats({
          logsByLevel: { error: 0, warn: 0, info: 0, debug: 0 },
          totalLogs: 0,
          reset: true,
        });
      }

      res.status(200).json({
        success: true,
        message: "Storage reset successfully",
      });
    } catch (error) {
      console.error("Error resetting storage:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reset storage",
      });
    }
  }

  private buildFilterCriteria(queryParams: LogQueryParams): FilterCriteria {
    const filters: FilterCriteria = {};

    if (queryParams.level) {
      filters.level = queryParams.level;
    }

    if (queryParams.message) {
      filters.message = queryParams.message;
    }

    if (queryParams.resourceId) {
      filters.resourceId = queryParams.resourceId;
    }

    if (queryParams.traceId) {
      filters.traceId = queryParams.traceId;
    }

    if (queryParams.spanId) {
      filters.spanId = queryParams.spanId;
    }

    if (queryParams.commit) {
      filters.commit = queryParams.commit;
    }

    if (queryParams.timestamp_start) {
      filters.timestampStart = new Date(queryParams.timestamp_start);
    }

    if (queryParams.timestamp_end) {
      filters.timestampEnd = new Date(queryParams.timestamp_end);
    }

    return filters;
  }
}
