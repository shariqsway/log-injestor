import { FilterCriteria, LogEntry, LogEntryInput } from "../types";
import { StorageService } from "./storageService";

const VALID_LOG_LEVELS = ["error", "warn", "info", "debug"] as const;
type ValidLogLevel = (typeof VALID_LOG_LEVELS)[number];

export class LogService {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

  async addLog(logData: LogEntryInput): Promise<LogEntry> {
    // Validate log level
    if (!this.isValidLogLevel(logData.level)) {
      throw new Error(
        `Invalid log level: ${
          logData.level
        }. Must be one of: ${VALID_LOG_LEVELS.join(", ")}`
      );
    }

    // Create complete log entry with auto-generated timestamp if not provided
    const log: LogEntry = {
      level: logData.level,
      message: logData.message,
      resourceId: logData.resourceId,
      timestamp: logData.timestamp || new Date().toISOString(),
      traceId: logData.traceId,
      spanId: logData.spanId,
      commit: logData.commit,
      metadata: logData.metadata,
    };

    // Additional validation for timestamp if provided
    if (logData.timestamp && !this.isValidISOString(logData.timestamp)) {
      throw new Error("Invalid timestamp format. Must be ISO 8601 format.");
    }

    return await this.storageService.addLog(log);
  }

  async getLogs(filters: FilterCriteria): Promise<LogEntry[]> {
    const allLogs = await this.storageService.readLogs();
    const filteredLogs = this.applyFilters(allLogs, filters);

    // Sort by timestamp in reverse chronological order (most recent first)
    return filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Get all logs without filtering
  async getAllLogs(): Promise<LogEntry[]> {
    const allLogs = await this.storageService.readLogs();
    return allLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Get log count
  async getLogCount(): Promise<number> {
    const logs = await this.storageService.readLogs();
    return logs.length;
  }

  // Get logs by level
  async getLogsByLevel(): Promise<Record<string, number>> {
    const logs = await this.storageService.readLogs();
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private applyFilters(logs: LogEntry[], filters: FilterCriteria): LogEntry[] {
    return logs.filter((log) => {
      // Level filter - exact match
      if (filters.level && log.level !== filters.level) {
        return false;
      }

      // Message filter - case-insensitive full-text search
      if (
        filters.message &&
        !log.message.toLowerCase().includes(filters.message.toLowerCase())
      ) {
        return false;
      }

      // ResourceId filter - exact match
      if (filters.resourceId && log.resourceId !== filters.resourceId) {
        return false;
      }

      // TraceId filter - exact match
      if (filters.traceId && log.traceId !== filters.traceId) {
        return false;
      }

      // SpanId filter - exact match
      if (filters.spanId && log.spanId !== filters.spanId) {
        return false;
      }

      // Commit filter - exact match
      if (filters.commit && log.commit !== filters.commit) {
        return false;
      }

      // Timestamp range filter
      const logTime = new Date(log.timestamp);
      if (filters.timestampStart && logTime < filters.timestampStart) {
        return false;
      }
      if (filters.timestampEnd && logTime > filters.timestampEnd) {
        return false;
      }

      return true;
    });
  }

  private isValidLogLevel(level: string): level is ValidLogLevel {
    return VALID_LOG_LEVELS.includes(level as ValidLogLevel);
  }

  private isValidISOString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString() === dateString;
  }
}
