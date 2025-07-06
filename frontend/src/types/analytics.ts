export interface LogsByLevel {
  error: number;
  warn: number;
  info: number;
  debug: number;
}

export interface HourlyLogData {
  hour: string;
  count: number;
  error: number;
  warn: number;
  info: number;
  debug: number;
}

export interface LogAnalyticsData {
  totalLogs: number;
  logsByLevel: LogsByLevel;
  logsByHour: HourlyLogData[];
  averageLogsPerHour: number;
}

export interface LogLevelConfig {
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export type LogLevel = "error" | "warn" | "info" | "debug";
