import { useCallback, useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import type { LogEntry, LogFilters, LogQueryParams } from "../types";
import { useDebounce } from "./useDebounce";

export function useLogs(filters: LogFilters) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the message filter to avoid excessive API calls
  const debouncedMessage = useDebounce(filters.message, 300);

  const buildQueryParams = useCallback(
    (filters: LogFilters): LogQueryParams => {
      const params: LogQueryParams = {};

      if (filters.level) params.level = filters.level;
      if (debouncedMessage) params.message = debouncedMessage;
      if (filters.resourceId) params.resourceId = filters.resourceId;
      if (filters.timestampStart)
        params.timestamp_start = filters.timestampStart;
      if (filters.timestampEnd) params.timestamp_end = filters.timestampEnd;
      if (filters.traceId) params.traceId = filters.traceId;
      if (filters.spanId) params.spanId = filters.spanId;
      if (filters.commit) params.commit = filters.commit;

      return params;
    },
    [debouncedMessage]
  );

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(filters);
      const fetchedLogs = await apiService.getLogs(queryParams);
      setLogs(fetchedLogs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch logs";
      setError(errorMessage);
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, buildQueryParams]);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const refetch = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch,
  };
}
