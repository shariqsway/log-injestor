import type { LogEntry, LogEntryInput, LogQueryParams } from "../types";

class ApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      if (data.success === false && data.error) {
        throw new Error(data.error);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }

  private buildQueryString(params: LogQueryParams): string {
    const searchParams = new URLSearchParams();

    // Only add non-empty parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  // GET /logs - Returns array of LogEntry
  async getLogs(filters: LogQueryParams = {}): Promise<LogEntry[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const url = `${this.baseUrl}/logs${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const logs = await this.handleResponse<LogEntry[]>(response);
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  }

  // POST /logs - Returns created LogEntry
  async createLog(logData: LogEntryInput): Promise<LogEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      const createdLog = await this.handleResponse<LogEntry>(response);
      return createdLog;
    } catch (error) {
      console.error("Error creating log:", error);
      throw error;
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
