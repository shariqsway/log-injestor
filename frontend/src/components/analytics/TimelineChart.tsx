import React from "react";
import type { HourlyLogData } from "../../types/analytics";

interface TimelineChartProps {
  data: HourlyLogData[];
}

const LEVEL_COLORS = {
  error: "bg-red-400",
  warn: "bg-yellow-400",
  info: "bg-blue-400",
  debug: "bg-gray-400",
} as const;

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const displayData = data.slice(-12); // Show last 12 hours

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateBarHeight = (value: number): string => {
    return `${(value / maxCount) * 100}%`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No timeline data available
        </div>
      ) : (
        <div className="space-y-2">
          {/* Chart */}
          <div className="flex items-end justify-between h-32 bg-white rounded p-2 border">
            {displayData.map((item, index) => (
              <div
                key={`${item.hour}-${index}`}
                className="flex flex-col items-center flex-1 mx-1"
              >
                <div className="w-full flex flex-col justify-end h-24 relative group">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    <div>Total: {item.count}</div>
                    {item.error > 0 && <div>Errors: {item.error}</div>}
                    {item.warn > 0 && <div>Warnings: {item.warn}</div>}
                    {item.info > 0 && <div>Info: {item.info}</div>}
                    {item.debug > 0 && <div>Debug: {item.debug}</div>}
                  </div>

                  {/* Stacked bars */}
                  {item.error > 0 && (
                    <div
                      className={`w-full ${LEVEL_COLORS.error} rounded-t transition-all duration-300`}
                      style={{ height: calculateBarHeight(item.error) }}
                    />
                  )}
                  {item.warn > 0 && (
                    <div
                      className={`w-full ${LEVEL_COLORS.warn} transition-all duration-300`}
                      style={{ height: calculateBarHeight(item.warn) }}
                    />
                  )}
                  {item.info > 0 && (
                    <div
                      className={`w-full ${LEVEL_COLORS.info} transition-all duration-300`}
                      style={{ height: calculateBarHeight(item.info) }}
                    />
                  )}
                  {item.debug > 0 && (
                    <div
                      className={`w-full ${LEVEL_COLORS.debug} rounded-b transition-all duration-300`}
                      style={{ height: calculateBarHeight(item.debug) }}
                    />
                  )}

                  {/* Show a minimal bar if no logs in this hour */}
                  {item.count === 0 && (
                    <div className="w-full bg-gray-200 h-1 rounded" />
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                  {formatTime(item.hour)}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded mr-2" />
              <span className="text-xs text-gray-600">Errors</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded mr-2" />
              <span className="text-xs text-gray-600">Warnings</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded mr-2" />
              <span className="text-xs text-gray-600">Info</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded mr-2" />
              <span className="text-xs text-gray-600">Debug</span>
            </div>
          </div>

          {/* Summary */}
          <div className="text-xs text-gray-600 text-center">
            Showing last {Math.min(data.length, 12)} hours of activity
          </div>
        </div>
      )}
    </div>
  );
};
