import React from "react";
import type { LogEntry as LogEntryType } from "../../types";
import { ErrorMessage } from "../common/ErrorMessage";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { LogEntry } from "./LogEntry";

interface LogListProps {
  logs: LogEntryType[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const LogList: React.FC<LogListProps> = ({
  logs,
  isLoading,
  error,
  onRetry,
}) => {
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={onRetry}
        className="max-w-2xl mx-auto"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading logs...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No logs found
        </h3>
        <p className="text-gray-500">
          No log entries match your current filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Log Entries ({logs.length})
        </h2>
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {logs.map((log, index) => (
          <LogEntry key={`${log.traceId}-${log.spanId}-${index}`} log={log} />
        ))}
      </div>
    </div>
  );
};
