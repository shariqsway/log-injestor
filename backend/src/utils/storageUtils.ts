import fs from "fs/promises";
import path from "path";
import { StorageData } from "../types";

export class StorageUtils {
  private static readonly filePath = path.join(
    __dirname,
    "../../data/logs.json"
  );

  static async resetStorage(): Promise<void> {
    try {
      const directory = path.dirname(this.filePath);
      await fs.mkdir(directory, { recursive: true });

      const initialData: StorageData = { logs: [] };
      await fs.writeFile(this.filePath, JSON.stringify(initialData, null, 2));
      console.log("Storage reset successfully");
    } catch (error) {
      console.error("Error resetting storage:", error);
      throw error;
    }
  }

  static async validateStorage(): Promise<boolean> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData.logs);
    } catch (error) {
      return false;
    }
  }

  static async getStorageInfo(): Promise<{
    exists: boolean;
    size: number;
    logCount: number;
  }> {
    try {
      const stats = await fs.stat(this.filePath);
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsedData = JSON.parse(data);

      return {
        exists: true,
        size: stats.size,
        logCount: parsedData.logs?.length || 0,
      };
    } catch (error) {
      return {
        exists: false,
        size: 0,
        logCount: 0,
      };
    }
  }
}
