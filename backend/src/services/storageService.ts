import fs from "fs/promises";
import path from "path";
import { LogEntry, StorageData } from "../types";

export class StorageService {
  private readonly filePath: string;
  private readonly lockTimeout = 5000;
  private writeLock = false;

  constructor() {
    this.filePath = path.join(__dirname, "../../data/logs.json");
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch (error) {
      const initialData: StorageData = { logs: [] };
      await this.ensureDirectoryExists();
      await fs.writeFile(this.filePath, JSON.stringify(initialData, null, 2));
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    const directory = path.dirname(this.filePath);
    try {
      await fs.access(directory);
    } catch (error) {
      await fs.mkdir(directory, { recursive: true });
    }
  }

  private async acquireWriteLock(): Promise<void> {
    const startTime = Date.now();

    // If lock is already held, wait for it to be released
    while (this.writeLock) {
      if (Date.now() - startTime > this.lockTimeout) {
        // Force release the lock if it's been held too long
        console.warn("Force releasing storage write lock due to timeout");
        this.writeLock = false;
        break;
      }
      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.writeLock = true;
  }

  private releaseWriteLock(): void {
    this.writeLock = false;
  }

  async readLogs(): Promise<LogEntry[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsedData: StorageData = JSON.parse(data);
      return parsedData.logs || [];
    } catch (error) {
      console.error("Error reading logs:", error);
      // If file doesn't exist or is corrupted, return empty array
      if ((error as any).code === "ENOENT") {
        await this.ensureDirectoryExists();
        const initialData: StorageData = { logs: [] };
        await fs.writeFile(this.filePath, JSON.stringify(initialData, null, 2));
        return [];
      }
      throw new Error("Failed to read logs from storage");
    }
  }

  async writeLogs(logs: LogEntry[]): Promise<void> {
    await this.acquireWriteLock();
    try {
      const data: StorageData = { logs };
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error writing logs:", error);
      throw new Error("Failed to write logs to storage");
    } finally {
      this.releaseWriteLock();
    }
  }

  async addLog(log: LogEntry): Promise<LogEntry> {
    let existingLogs: LogEntry[] = [];

    try {
      // First, try to read existing logs
      existingLogs = await this.readLogs();
    } catch (error) {
      console.warn(
        "Could not read existing logs, starting with empty array:",
        error
      );
      existingLogs = [];
    }

    // Acquire lock and write
    await this.acquireWriteLock();
    try {
      const updatedLogs = [...existingLogs, log];
      const data: StorageData = { logs: updatedLogs };
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
      return log;
    } catch (error) {
      console.error("Error adding log:", error);
      throw new Error("Failed to add log to storage");
    } finally {
      this.releaseWriteLock();
    }
  }

  clearLock(): void {
    this.writeLock = false;
    console.log("Storage lock cleared manually");
  }

  isLocked(): boolean {
    return this.writeLock;
  }
}
