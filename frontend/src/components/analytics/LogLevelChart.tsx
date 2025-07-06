import React from "react";
import type { LogLevel, LogsByLevel } from "../../types/analytics";

interface LogLevelChartProps {
  data: LogsByLevel;
}

interface ChartDataItem {
  level: LogLevel;
  count: number;
  percentage: number;
  color: string;
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  error: "#ef4444",
  warn: "#f59e0b",
  info: "#3b82f6",
  debug: "#6b7280",
};

export const LogLevelChart: React.FC<LogLevelChartProps> = ({ data }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  const chartData: ChartDataItem[] = (
    Object.entries(data) as [LogLevel, number][]
  ).map(([level, count]) => ({
    level,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: LOG_LEVEL_COLORS[level],
  }));

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Logs by Level</h3>

      {total === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No log level data available
        </div>
      ) : (
        <>
          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {chartData.map(({ level, count, percentage, color }) => (
              <div key={level} className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-700 capitalize">
                  {level}
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-right text-gray-600">
                  {count}
                </div>
                <div className="w-12 text-xs text-right text-gray-500">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {chartData
              .filter(({ count }) => count > 0)
              .map(({ level, color }) => (
                <div key={level} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600 capitalize">
                    {level}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};
