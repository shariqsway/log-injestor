export interface LogEntry {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  resourceId: string;
  timestamp: string;
  traceId: string;
  spanId: string;
  commit: string;
  metadata: Record<string, unknown>;
}

export interface LogEntryInput {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  resourceId: string;
  timestamp?: string;
  traceId: string;
  spanId: string;
  commit: string;
  metadata: Record<string, unknown>;
}

export interface LogFilters {
  level: string;
  message: string;
  resourceId: string;
  timestampStart: string;
  timestampEnd: string;
  traceId: string;
  spanId: string;
  commit: string;
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

export interface ErrorResponse {
  success: false;
  error: string;
}

export type LogLevel = "error" | "warn" | "info" | "debug";

export interface UseLogsReturn {
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseFiltersReturn {
  filters: LogFilters;
  updateFilter: <K extends keyof LogFilters>(
    key: K,
    value: LogFilters[K]
  ) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}
