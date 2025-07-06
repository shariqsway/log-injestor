import React, { useState } from "react";
import type { LogEntry as LogEntryType } from "../../types";
import { DateUtils } from "../../utils/dateUtils";

interface LogEntryProps {
  log: LogEntryType;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const getLevelConfig = (level: string) => {
    switch (level) {
      case "error":
        return {
          containerClass:
            "border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-25",
          headerClass: "bg-red-100",
          textColor: "text-red-900",
          badgeClass: "bg-red-100 text-red-800 border border-red-200",
          iconColor: "text-red-500",
          icon: "🚨",
        };
      case "warn":
        return {
          containerClass:
            "border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-25",
          headerClass: "bg-yellow-100",
          textColor: "text-yellow-900",
          badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          iconColor: "text-yellow-500",
          icon: "⚠️",
        };
      case "info":
        return {
          containerClass:
            "border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25",
          headerClass: "bg-blue-100",
          textColor: "text-blue-900",
          badgeClass: "bg-blue-100 text-blue-800 border border-blue-200",
          iconColor: "text-blue-500",
          icon: "ℹ️",
        };
      case "debug":
        return {
          containerClass:
            "border-l-4 border-gray-500 bg-gradient-to-r from-gray-50 to-gray-25",
          headerClass: "bg-gray-100",
          textColor: "text-gray-900",
          badgeClass: "bg-gray-100 text-gray-800 border border-gray-200",
          iconColor: "text-gray-500",
          icon: "🔧",
        };
      default:
        return {
          containerClass: "border-l-4 border-gray-300 bg-white",
          headerClass: "bg-gray-50",
          textColor: "text-gray-800",
          badgeClass: "bg-gray-100 text-gray-800 border border-gray-200",
          iconColor: "text-gray-500",
          icon: "📄",
        };
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const config = getLevelConfig(log.level);

  return (
    <div
      className={`
      ${config.containerClass}
      rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300
      border border-l-4 border-gray-200 overflow-hidden
      mb-4 last:mb-0 group
    `}
    >
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span
              className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
              ${config.badgeClass} shadow-sm
            `}
            >
              <span className="mr-2 text-sm">{config.icon}</span>
              {log.level.toUpperCase()}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {DateUtils.formatTimestamp(log.timestamp)}
              </span>
              <span className="text-xs text-gray-500">
                {DateUtils.getRelativeTime(log.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {copyFeedback && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md animate-fade-in">
                {copyFeedback} copied!
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${
                  isExpanded
                    ? "bg-gray-200 text-gray-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }
              `}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Log message */}
        <div className="mb-4">
          <p
            className={`text-sm font-medium ${config.textColor} leading-relaxed p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200`}
          >
            {log.message}
          </p>
        </div>

        {/* Resource info in grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "🖥️ Resource", value: log.resourceId, key: "resourceId" },
            { label: "🔗 Trace", value: log.traceId, key: "traceId" },
            { label: "📊 Span", value: log.spanId, key: "spanId" },
            { label: "📝 Commit", value: log.commit, key: "commit" },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex flex-col space-y-1">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {label}
              </span>
              <button
                onClick={() => copyToClipboard(value, label.split(" ")[1])}
                className="group/copy text-left p-2 bg-white bg-opacity-80 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                title="Click to copy"
              >
                <code className="text-xs text-gray-800 group-hover/copy:text-blue-700 font-mono break-all">
                  {value}
                </code>
                <svg
                  className="w-3 h-3 inline-block ml-1 opacity-0 group-hover/copy:opacity-100 transition-opacity duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded metadata section */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 bg-opacity-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              <span className="mr-2">📋</span>
              Metadata
            </h4>
            <button
              onClick={() =>
                copyToClipboard(
                  JSON.stringify(log.metadata, null, 2),
                  "Metadata"
                )
              }
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy JSON</span>
            </button>
          </div>
          <pre className="text-xs text-gray-700 bg-white p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border border-gray-200 shadow-inner">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
