import { LogService } from "../services/logService";
import { FilterCriteria, LogEntry } from "../types";

// Mock the StorageService
jest.mock("../services/storageService", () => {
  return {
    StorageService: jest.fn().mockImplementation(() => ({
      addLog: jest.fn(),
      readLogs: jest.fn(),
    })),
  };
});

describe("LogService", () => {
  let logService: LogService;
  let mockStorageService: any;

  // Use predictable test data that doesn't depend on actual file content
  const mockLogs: LogEntry[] = [
    {
      level: "error",
      message: "Test database error",
      resourceId: "test-server-1",
      timestamp: "2023-09-15T10:00:00.000Z",
      traceId: "trace-1",
      spanId: "span-1",
      commit: "commit1",
      metadata: { test: true },
    },
    {
      level: "info",
      message: "Test user login",
      resourceId: "test-server-2",
      timestamp: "2023-09-15T11:00:00.000Z",
      traceId: "trace-2",
      spanId: "span-2",
      commit: "commit2",
      metadata: { userId: "test123" },
    },
    {
      level: "warn",
      message: "Test warning message",
      resourceId: "test-server-1",
      timestamp: "2023-09-15T12:00:00.000Z",
      traceId: "trace-3",
      spanId: "span-3",
      commit: "commit3",
      metadata: { threshold: 80 },
    },
    {
      level: "debug",
      message: "Test debug info",
      resourceId: "test-server-3",
      timestamp: "2023-09-15T09:00:00.000Z",
      traceId: "trace-4",
      spanId: "span-4",
      commit: "commit4",
      metadata: { debugData: "test" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    logService = new LogService();
    mockStorageService = (logService as any).storageService;
    // Mock returns a copy of our test data
    mockStorageService.readLogs.mockResolvedValue([...mockLogs]);
  });

  describe("getLogs with filtering", () => {
    it("should return all logs when no filters are provided", async () => {
      const filters: FilterCriteria = {};
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(4);
      // Should be sorted by timestamp (newest first)
      expect(result[0]?.timestamp).toBe("2023-09-15T12:00:00.000Z");
      expect(result[1]?.timestamp).toBe("2023-09-15T11:00:00.000Z");
      expect(result[2]?.timestamp).toBe("2023-09-15T10:00:00.000Z");
      expect(result[3]?.timestamp).toBe("2023-09-15T09:00:00.000Z");
    });

    it("should filter logs by level", async () => {
      const filters: FilterCriteria = { level: "error" };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.level).toBe("error");
      expect(result[0]?.message).toBe("Test database error");
    });

    it("should filter logs by case-insensitive message search", async () => {
      const filters: FilterCriteria = { message: "TEST" };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(4); // All test messages contain "test"
      expect(
        result.every((log) => log.message.toLowerCase().includes("test"))
      ).toBe(true);
    });

    it("should filter logs by specific message content", async () => {
      const filters: FilterCriteria = { message: "database" };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.message).toContain("database");
    });

    it("should filter logs by resourceId", async () => {
      const filters: FilterCriteria = { resourceId: "test-server-1" };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(2);
      expect(result.every((log) => log.resourceId === "test-server-1")).toBe(
        true
      );
    });

    it("should filter logs by timestamp range", async () => {
      const filters: FilterCriteria = {
        timestampStart: new Date("2023-09-15T10:30:00.000Z"),
        timestampEnd: new Date("2023-09-15T11:30:00.000Z"),
      };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.message).toBe("Test user login");
    });

    it("should filter logs by traceId", async () => {
      const filters: FilterCriteria = { traceId: "trace-2" };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.traceId).toBe("trace-2");
    });

    it("should combine multiple filters (AND logic)", async () => {
      const filters: FilterCriteria = {
        level: "error",
        resourceId: "test-server-1",
        message: "database",
      };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.level).toBe("error");
      expect(result[0]?.resourceId).toBe("test-server-1");
      expect(result[0]?.message.toLowerCase()).toContain("database");
    });

    it("should return empty array when no logs match filters", async () => {
      const filters: FilterCriteria = {
        level: "error",
        resourceId: "nonexistent-server",
      };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(0);
    });

    it("should filter by spanId and commit correctly", async () => {
      const filters: FilterCriteria = {
        spanId: "span-3",
        commit: "commit3",
      };
      const result = await logService.getLogs(filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.spanId).toBe("span-3");
      expect(result[0]?.commit).toBe("commit3");
      expect(result[0]?.level).toBe("warn");
    });

    it("should handle edge cases in filtering", async () => {
      // Test with empty string message filter
      const emptyMessageFilter: FilterCriteria = { message: "" };
      const emptyResult = await logService.getLogs(emptyMessageFilter);
      expect(emptyResult).toHaveLength(4); // Should return all logs

      // Test with non-existent level
      const invalidLevelFilter: FilterCriteria = { level: "critical" as any };
      const invalidResult = await logService.getLogs(invalidLevelFilter);
      expect(invalidResult).toHaveLength(0);
    });
  });

  describe("addLog", () => {
    it("should add log with auto-generated timestamp", async () => {
      const logData = {
        level: "info" as const,
        message: "Test message",
        resourceId: "test-server",
        traceId: "test-trace",
        spanId: "test-span",
        commit: "test-commit",
        metadata: { test: true },
      };

      const mockCreatedLog = {
        ...logData,
        timestamp: "2023-09-15T13:00:00.000Z",
      };
      mockStorageService.addLog.mockResolvedValue(mockCreatedLog);

      const result = await logService.addLog(logData);

      expect(mockStorageService.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          ...logData,
          timestamp: expect.any(String),
        })
      );
      expect(result).toEqual(mockCreatedLog);
    });

    it("should validate log level", async () => {
      const logData = {
        level: "invalid" as any,
        message: "Test message",
        resourceId: "test-server",
        traceId: "test-trace",
        spanId: "test-span",
        commit: "test-commit",
        metadata: { test: true },
      };

      await expect(logService.addLog(logData)).rejects.toThrow(
        "Invalid log level: invalid. Must be one of: error, warn, info, debug"
      );
    });

    it("should preserve provided timestamp if valid", async () => {
      const providedTimestamp = "2023-09-15T14:00:00.000Z";
      const logData = {
        level: "info" as const,
        message: "Test message",
        resourceId: "test-server",
        timestamp: providedTimestamp,
        traceId: "test-trace",
        spanId: "test-span",
        commit: "test-commit",
        metadata: { test: true },
      };

      const mockCreatedLog = { ...logData };
      mockStorageService.addLog.mockResolvedValue(mockCreatedLog);

      const result = await logService.addLog(logData);

      expect(mockStorageService.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: providedTimestamp,
        })
      );
      expect(result).toEqual(mockCreatedLog);
    });

    it("should reject invalid timestamp format", async () => {
      const logData = {
        level: "info" as const,
        message: "Test message",
        resourceId: "test-server",
        timestamp: "invalid-timestamp",
        traceId: "test-trace",
        spanId: "test-span",
        commit: "test-commit",
        metadata: { test: true },
      };

      await expect(logService.addLog(logData)).rejects.toThrow(
        "Invalid timestamp format. Must be ISO 8601 format."
      );
    });
  });

  describe("additional methods", () => {
    it("should get all logs without filtering", async () => {
      const result = await logService.getAllLogs();

      expect(result).toHaveLength(4);
      expect(mockStorageService.readLogs).toHaveBeenCalled();
      // Should be sorted by timestamp (newest first)
      expect(result[0]?.timestamp).toBe("2023-09-15T12:00:00.000Z");
    });

    it("should get log count", async () => {
      const count = await logService.getLogCount();

      expect(count).toBe(4);
      expect(mockStorageService.readLogs).toHaveBeenCalled();
    });

    it("should get logs by level", async () => {
      const logsByLevel = await logService.getLogsByLevel();

      expect(logsByLevel).toEqual({
        error: 1,
        info: 1,
        warn: 1,
        debug: 1,
      });
      expect(mockStorageService.readLogs).toHaveBeenCalled();
    });
  });
});
