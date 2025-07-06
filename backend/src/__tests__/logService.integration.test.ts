import { LogService } from "../services/logService";
import { FilterCriteria } from "../types";

describe("LogService Integration Tests", () => {
  let logService: LogService;

  beforeEach(() => {
    logService = new LogService();
  });

  describe("with actual data file", () => {
    it("should read logs from actual file and return proper structure", async () => {
      const filters: FilterCriteria = {};
      const result = await logService.getLogs(filters);

      // Test structure without depending on specific content
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        const firstLog = result[0];

        // Ensure firstLog exists and has all required properties
        expect(firstLog).toBeDefined();
        expect(firstLog).toHaveProperty("level");
        expect(firstLog).toHaveProperty("message");
        expect(firstLog).toHaveProperty("resourceId");
        expect(firstLog).toHaveProperty("timestamp");
        expect(firstLog).toHaveProperty("traceId");
        expect(firstLog).toHaveProperty("spanId");
        expect(firstLog).toHaveProperty("commit");
        expect(firstLog).toHaveProperty("metadata");

        if (firstLog) {
          // Validate log level is one of the valid values
          expect(["error", "warn", "info", "debug"]).toContain(firstLog.level);

          // Validate timestamp format
          expect(new Date(firstLog.timestamp).toISOString()).toBe(
            firstLog.timestamp
          );

          // Validate types
          expect(typeof firstLog.message).toBe("string");
          expect(typeof firstLog.resourceId).toBe("string");
          expect(typeof firstLog.traceId).toBe("string");
          expect(typeof firstLog.spanId).toBe("string");
          expect(typeof firstLog.commit).toBe("string");
          expect(typeof firstLog.metadata).toBe("object");
        }
      }
    });

    it("should sort logs by timestamp in descending order", async () => {
      const result = await logService.getLogs({});

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const currentLog = result[i];
          const nextLog = result[i + 1];

          if (currentLog && nextLog) {
            const currentTime = new Date(currentLog.timestamp).getTime();
            const nextTime = new Date(nextLog.timestamp).getTime();
            expect(currentTime).toBeGreaterThanOrEqual(nextTime);
          }
        }
      }
    });

    it("should filter by level correctly", async () => {
      const result = await logService.getLogs({ level: "error" });

      expect(result.every((log) => log.level === "error")).toBe(true);
    });

    it("should filter by message correctly", async () => {
      // Get all logs first to find a message to search for
      const allLogs = await logService.getAllLogs();

      if (allLogs.length > 0) {
        const firstLog = allLogs[0];
        if (firstLog) {
          // Extract a word from the first log's message to search for
          const searchTerm = firstLog.message.split(" ")[0]?.toLowerCase();

          if (searchTerm) {
            const result = await logService.getLogs({ message: searchTerm });
            expect(result.length).toBeGreaterThan(0);
            expect(
              result.every((log) =>
                log.message.toLowerCase().includes(searchTerm)
              )
            ).toBe(true);
          }
        }
      }
    });

    it("should return count matching actual logs", async () => {
      const allLogs = await logService.getAllLogs();
      const count = await logService.getLogCount();

      expect(count).toBe(allLogs.length);
    });

    it("should group logs by level correctly", async () => {
      const allLogs = await logService.getAllLogs();
      const logsByLevel = await logService.getLogsByLevel();

      // Count manually
      const manualCount = allLogs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(logsByLevel).toEqual(manualCount);
    });

    it("should handle empty filter results gracefully", async () => {
      const result = await logService.getLogs({
        resourceId: "non-existent-resource-id-12345",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it("should handle timestamp range filtering", async () => {
      const allLogs = await logService.getAllLogs();

      if (allLogs.length > 1) {
        // Use actual timestamps from the data
        const oldestLog = allLogs[allLogs.length - 1];
        const newestLog = allLogs[0];

        if (oldestLog && newestLog) {
          const startTime = new Date(oldestLog.timestamp);
          const endTime = new Date(newestLog.timestamp);

          const result = await logService.getLogs({
            timestampStart: startTime,
            timestampEnd: endTime,
          });

          expect(result.length).toBeGreaterThan(0);
          expect(result.length).toBeLessThanOrEqual(allLogs.length);

          // Verify all returned logs are within the time range
          result.forEach((log) => {
            const logTime = new Date(log.timestamp);
            expect(logTime.getTime()).toBeGreaterThanOrEqual(
              startTime.getTime()
            );
            expect(logTime.getTime()).toBeLessThanOrEqual(endTime.getTime());
          });
        }
      }
    });
  });

  describe("adding logs to actual file", () => {
    it("should add a new log and retrieve it", async () => {
      const initialCount = await logService.getLogCount();

      const uniqueId = Date.now().toString();
      const newLog = {
        level: "debug" as const,
        message: `Test integration log ${uniqueId}`,
        resourceId: `integration-test-${uniqueId}`,
        traceId: `trace-${uniqueId}`,
        spanId: `span-${uniqueId}`,
        commit: "test-commit",
        metadata: { test: true, timestamp: Date.now(), uniqueId },
      };

      const addedLog = await logService.addLog(newLog);
      expect(addedLog).toMatchObject(newLog);
      expect(addedLog.timestamp).toBeDefined();

      const newCount = await logService.getLogCount();
      expect(newCount).toBe(initialCount + 1);

      // Verify the log can be retrieved by traceId
      const foundLogsByTrace = await logService.getLogs({
        traceId: newLog.traceId,
      });
      expect(foundLogsByTrace).toHaveLength(1);
      expect(foundLogsByTrace[0]).toMatchObject(newLog);

      // Verify the log can be retrieved by resourceId
      const foundLogsByResource = await logService.getLogs({
        resourceId: newLog.resourceId,
      });
      expect(foundLogsByResource).toHaveLength(1);
      expect(foundLogsByResource[0]).toMatchObject(newLog);
    });

    it("should validate log levels on add", async () => {
      const invalidLog = {
        level: "invalid" as any,
        message: "Test message",
        resourceId: "test-server",
        traceId: "test-trace",
        spanId: "test-span",
        commit: "test-commit",
        metadata: { test: true },
      };

      await expect(logService.addLog(invalidLog)).rejects.toThrow(
        "Invalid log level: invalid. Must be one of: error, warn, info, debug"
      );
    });
  });
});
