import React, { useEffect, useState } from "react";
import { LogAnalytics } from "./components/analytics/LogAnalytics";
import { ErrorMessage } from "./components/common/ErrorMessage";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { FilterBar } from "./components/filters/FilterBar";
import { LogList } from "./components/logs/LogList";
import { useFilters } from "./hooks/useFilters";
import { useLogs } from "./hooks/useLogs";
import { useWebSocket } from "./hooks/useWebSocket";
import { apiService } from "./services/apiService";

const App: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const { filters, updateFilter, resetFilters, hasActiveFilters } =
    useFilters();
  const { logs, isLoading, error, refetch } = useLogs(filters);

  // WebSocket connection for real-time updates
  const {
    isConnected,
    connectionState,
    newLogNotification,
    systemNotification,
    reconnect,
    clearNewLogNotification,
    clearSystemNotification,
  } = useWebSocket();

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await apiService.healthCheck();
        setIsHealthy(healthy);
      } catch (error) {
        console.error("Health check failed:", error);
        setIsHealthy(false);
      }
    };

    checkHealth();
  }, []);

  // Auto-refresh logs when new log notification arrives
  useEffect(() => {
    if (newLogNotification) {
      refetch();
    }
  }, [newLogNotification, refetch]);

  // Show loading while health check is in progress
  if (isHealthy === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Connecting to server...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we establish connection
          </p>
        </div>
      </div>
    );
  }

  // Show error if backend is not healthy
  if (!isHealthy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h1>
          </div>
          <ErrorMessage
            message="Unable to connect to the backend server. Please ensure the server is running on port 3001."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-400";
      case "connecting":
        return "bg-yellow-400 animate-pulse";
      case "disconnected":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case "connected":
        return "Real-time Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Real-time notifications */}
      {newLogNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                New Log Entry
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {newLogNotification.message}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    newLogNotification.level === "error"
                      ? "bg-red-100 text-red-800"
                      : newLogNotification.level === "warn"
                      ? "bg-yellow-100 text-yellow-800"
                      : newLogNotification.level === "info"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {newLogNotification.level.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {newLogNotification.resourceId}
                </span>
              </div>
            </div>
            <button
              onClick={clearNewLogNotification}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* System notifications */}
      {systemNotification && (
        <div
          className={`fixed top-4 left-4 z-50 rounded-lg shadow-lg p-4 max-w-md ${
            systemNotification.level === "error"
              ? "bg-red-100 border border-red-200"
              : systemNotification.level === "warning"
              ? "bg-yellow-100 border border-yellow-200"
              : "bg-blue-100 border border-blue-200"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className={`w-5 h-5 ${
                  systemNotification.level === "error"
                    ? "text-red-500"
                    : systemNotification.level === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4
                className={`text-sm font-medium ${
                  systemNotification.level === "error"
                    ? "text-red-900"
                    : systemNotification.level === "warning"
                    ? "text-yellow-900"
                    : "text-blue-900"
                }`}
              >
                System Notification
              </h4>
              <p
                className={`text-xs mt-1 ${
                  systemNotification.level === "error"
                    ? "text-red-700"
                    : systemNotification.level === "warning"
                    ? "text-yellow-700"
                    : "text-blue-700"
                }`}
              >
                {systemNotification.message}
              </p>
            </div>
            <button
              onClick={clearSystemNotification}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Log Ingestion System
                </h1>
                <p className="text-sm text-gray-600">
                  Monitor and analyze your application logs in real-time
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Analytics Toggle */}
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  showAnalytics
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-4 h-4"
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
                <span>Analytics</span>
              </button>

              {/* WebSocket Status */}
              <div className="flex items-center text-sm border border-gray-200 px-3 py-1 rounded-full">
                <div
                  className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full mr-2`}
                ></div>
                <span className="text-gray-600">
                  {getConnectionStatusText()}
                </span>
                {!isConnected && (
                  <button
                    onClick={reconnect}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Reconnect
                  </button>
                )}
              </div>

              {/* Server Status */}
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Server Connected
              </div>

              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {logs.length} logs
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Analytics Section - BONUS FEATURE */}
          {showAnalytics && <LogAnalytics logs={logs} isLoading={isLoading} />}

          {/* Filter Section */}
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={resetFilters}
            hasActiveFilters={hasActiveFilters()}
          />

          {/* Logs Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Log Entries
                      {isConnected && (
                        <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          🔴 Live
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isLoading
                        ? "Loading..."
                        : `${logs.length} entries found`}
                      {hasActiveFilters() && " (filtered)"}
                      {isConnected && " • Real-time updates enabled"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!isLoading && (
                    <button
                      onClick={refetch}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-blue-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Refresh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <LogList
                logs={logs}
                isLoading={isLoading}
                error={error}
                onRetry={refetch}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <p className="font-medium">Log Ingestion and Querying System</p>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <p>Built with TypeScript, React, Express & Socket.IO</p>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <p className="flex items-center space-x-1">
                <span>🐳 Docker Ready</span>
                <span>•</span>
                <span>📊 Analytics</span>
                <span>•</span>
                <span>🔄 Real-time</span>
                <span>•</span>
                <span>🧪 Tested</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full`}
                ></div>
                <span>Backend API:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {import.meta.env.VITE_API_URL || "http://localhost:3001"}
                </code>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
