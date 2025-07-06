export interface LogEntry {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  resourceId: string;
  timestamp: string;
  traceId: string;
  spanId: string;
  commit: string;
  metadata: Record<string, any>;
}

export interface LogEntryInput {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  resourceId: string;
  timestamp?: string;
  traceId: string;
  spanId: string;
  commit: string;
  metadata: Record<string, any>;
}

export interface LogQueryParams {
  level?: string;
  message?: string;
  resourceId?: string;
  timestamp_start?: string;
  timestamp_end?: string;
  traceId?: string;
  spanId?: string;
  commit?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StorageData {
  logs: LogEntry[];
}

export interface FilterCriteria {
  level?: string;
  message?: string;
  resourceId?: string;
  timestampStart?: Date;
  timestampEnd?: Date;
  traceId?: string;
  spanId?: string;
  commit?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
