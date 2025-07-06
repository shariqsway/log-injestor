import React, { useMemo } from "react";
import type { LogEntry } from "../../types";
import type {
  HourlyLogData,
  LogAnalyticsData,
  LogLevel,
  LogLevelConfig,
  LogsByLevel,
} from "../../types/analytics";
import { LogLevelChart } from "./LogLevelChart";
import { TimelineChart } from "./TimelineChart";

interface LogAnalyticsProps {
  logs: LogEntry[];
  isLoading: boolean;
}

const LOG_LEVEL_CONFIGS: Record<LogLevel, LogLevelConfig> = {
  error: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "🚨",
  },
  warn: {
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "⚠️",
  },
  info: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "ℹ️",
  },
  debug: {
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: "🔧",
  },
};

const DEFAULT_CONFIG: LogLevelConfig = {
  color: "text-gray-600",
  bg: "bg-gray-50",
  border: "border-gray-200",
  icon: "📄",
};

export const LogAnalytics: React.FC<LogAnalyticsProps> = ({
  logs,
  isLoading,
}) => {
  const analytics = useMemo((): LogAnalyticsData => {
    if (logs.length === 0) {
      return {
        totalLogs: 0,
        logsByLevel: { error: 0, warn: 0, info: 0, debug: 0 },
        logsByHour: [],
        averageLogsPerHour: 0,
      };
    }

    // Count logs by level
    const logsByLevel = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});

    // Group logs by hour for timeline
    const hourlyDataMap = new Map<string, HourlyLogData>();

    logs.forEach((log) => {
      const hour =
        new Date(log.timestamp).toISOString().substring(0, 13) + ":00:00.000Z";

      const existing = hourlyDataMap.get(hour);
      if (existing) {
        existing.count++;
        existing[log.level as LogLevel]++;
      } else {
        const newHourData: HourlyLogData = {
          hour,
          count: 1,
          error: log.level === "error" ? 1 : 0,
          warn: log.level === "warn" ? 1 : 0,
          info: log.level === "info" ? 1 : 0,
          debug: log.level === "debug" ? 1 : 0,
        };
        hourlyDataMap.set(hour, newHourData);
      }
    });

    // Convert map to array and sort by time
    const logsByHour = Array.from(hourlyDataMap.values()).sort(
      (a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime()
    );

    const typedLogsByLevel: LogsByLevel = {
      error: logsByLevel.error || 0,
      warn: logsByLevel.warn || 0,
      info: logsByLevel.info || 0,
      debug: logsByLevel.debug || 0,
    };

    return {
      totalLogs: logs.length,
      logsByLevel: typedLogsByLevel,
      logsByHour,
      averageLogsPerHour:
        logsByHour.length > 0 ? Math.round(logs.length / logsByHour.length) : 0,
    };
  }, [logs]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-500">
            Add some log entries to see analytics charts and statistics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Log Analytics
              </h2>
              <p className="text-sm text-gray-600">
                Visual insights into your log data
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.totalLogs}
            </div>
            <div className="text-xs text-gray-500">Total Logs</div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(Object.entries(analytics.logsByLevel) as [LogLevel, number][]).map(
            ([level, count]) => {
              const config = LOG_LEVEL_CONFIGS[level] || DEFAULT_CONFIG;

              return (
                <div
                  key={level}
                  className={`${config.bg} ${config.border} border rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${config.color}`}>
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {level}
                      </div>
                    </div>
                    <div className="text-xl">{config.icon}</div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LogLevelChart data={analytics.logsByLevel} />
          <TimelineChart data={analytics.logsByHour} />
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-700">
                  {analytics.averageLogsPerHour}
                </div>
                <div className="text-xs text-green-600">Avg Logs/Hour</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-700">
                  {analytics.logsByHour.length}
                </div>
                <div className="text-xs text-blue-600">Active Hours</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-700">
                  {(
                    (analytics.logsByLevel.error / analytics.totalLogs) * 100 ||
                    0
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-xs text-purple-600">Error Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
