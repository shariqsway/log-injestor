import React, { useEffect, useRef, useState } from "react";
import { DateUtils } from "../../utils/dateUtils";

interface DateTimeFilterProps {
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  className?: string;
}

export const DateTimeFilter: React.FC<DateTimeFilterProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  className = "",
}) => {
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close quick filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowQuickFilters(false);
      }
    };

    if (showQuickFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQuickFilters]);

  const handleStartChange = (value: string) => {
    if (value) {
      onStartChange(DateUtils.datetimeLocalToISO(value));
    } else {
      onStartChange("");
    }
  };

  const handleEndChange = (value: string) => {
    if (value) {
      onEndChange(DateUtils.datetimeLocalToISO(value));
    } else {
      onEndChange("");
    }
  };

  const handleQuickFilter = (
    range: "last-hour" | "last-day" | "last-week" | "last-month"
  ) => {
    const { start, end } = DateUtils.getDateRange(range);
    onStartChange(start);
    onEndChange(end);
    setShowQuickFilters(false);
  };

  const clearDateRange = () => {
    onStartChange("");
    onEndChange("");
    setShowQuickFilters(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Time Range</label>
        <div className="flex items-center space-x-2">
          {(startValue || endValue) && (
            <button
              onClick={clearDateRange}
              className="text-xs text-red-600 hover:text-red-800 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-50"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowQuickFilters(!showQuickFilters)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50 border border-blue-200"
          >
            Quick Filters
          </button>
        </div>
      </div>

      {/* Quick filter buttons - only show when toggled */}
      {showQuickFilters && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFilter("last-hour")}
              className="px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200 border border-gray-200 hover:border-blue-300"
            >
              Last Hour
            </button>
            <button
              onClick={() => handleQuickFilter("last-day")}
              className="px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200 border border-gray-200 hover:border-blue-300"
            >
              Last Day
            </button>
            <button
              onClick={() => handleQuickFilter("last-week")}
              className="px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200 border border-gray-200 hover:border-blue-300"
            >
              Last Week
            </button>
            <button
              onClick={() => handleQuickFilter("last-month")}
              className="px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors duration-200 border border-gray-200 hover:border-blue-300"
            >
              Last Month
            </button>
          </div>
        </div>
      )}

      {/* Custom date inputs */}
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="timestamp-start"
            className="text-xs font-medium text-gray-600"
          >
            Start Time
          </label>
          <input
            id="timestamp-start"
            type="datetime-local"
            value={DateUtils.isoToDatetimeLocal(startValue)}
            onChange={(e) => handleStartChange(e.target.value)}
            className="
              px-3 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              text-sm transition-colors duration-200
              bg-white hover:border-gray-400
            "
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="timestamp-end"
            className="text-xs font-medium text-gray-600"
          >
            End Time
          </label>
          <input
            id="timestamp-end"
            type="datetime-local"
            value={DateUtils.isoToDatetimeLocal(endValue)}
            onChange={(e) => handleEndChange(e.target.value)}
            className="
              px-3 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              text-sm transition-colors duration-200
              bg-white hover:border-gray-400
            "
          />
        </div>
      </div>
    </div>
  );
};
