import React, { useState } from "react";
import type { LogFilters } from "../../types";
import { Button } from "../common/Button";
import { DateTimeFilter } from "./DateTimeFilter";
import { LevelFilter } from "./LevelFilter";
import { TextFilter } from "./TextFilter";

interface FilterBarProps {
  filters: LogFilters;
  onFilterChange: <K extends keyof LogFilters>(
    key: K,
    value: LogFilters[K]
  ) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Filter Logs
              </h2>
              <p className="text-sm text-gray-600">
                Search and filter log entries to find what you need
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Filters Active
              </div>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Primary filters */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <TextFilter
              id="message-filter"
              label="🔍 Search Message"
              placeholder="Search in log messages..."
              value={filters.message}
              onChange={(value) => onFilterChange("message", value)}
            />
          </div>

          <div className="space-y-2">
            <LevelFilter
              value={filters.level}
              onChange={(value) => onFilterChange("level", value)}
            />
          </div>

          <div className="space-y-2">
            <TextFilter
              id="resource-filter"
              label="🖥️ Resource ID"
              placeholder="e.g., server-1234"
              value={filters.resourceId}
              onChange={(value) => onFilterChange("resourceId", value)}
            />
          </div>

          <div className="space-y-2">
            <DateTimeFilter
              startValue={filters.timestampStart}
              endValue={filters.timestampEnd}
              onStartChange={(value) => onFilterChange("timestampStart", value)}
              onEndChange={(value) => onFilterChange("timestampEnd", value)}
            />
          </div>
        </div>

        {/* Advanced filters toggle */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
          >
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                showAdvanced ? "rotate-90" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="font-medium">
              {showAdvanced ? "Hide" : "Show"} Advanced Filters
            </span>
            <span className="text-xs text-gray-400 group-hover:text-gray-600">
              (Trace ID, Span ID, Commit Hash)
            </span>
          </button>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextFilter
                  id="trace-filter"
                  label="🔗 Trace ID"
                  placeholder="e.g., abc-xyz-123"
                  value={filters.traceId}
                  onChange={(value) => onFilterChange("traceId", value)}
                />

                <TextFilter
                  id="span-filter"
                  label="📊 Span ID"
                  placeholder="e.g., span-456"
                  value={filters.spanId}
                  onChange={(value) => onFilterChange("spanId", value)}
                />

                <TextFilter
                  id="commit-filter"
                  label="📝 Commit Hash"
                  placeholder="e.g., 5e5342f"
                  value={filters.commit}
                  onChange={(value) => onFilterChange("commit", value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
