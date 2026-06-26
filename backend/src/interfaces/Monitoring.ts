import type { SystemLogEntry } from "./SystemLog.js";

export type ServiceHealthStatus = "UP" | "DOWN";

export interface ServiceHealthSnapshot {
  name: string;
  url: string;
  healthUrl: string;
  status: ServiceHealthStatus;
  statusCode: number | null;
  latencyMs: number | null;
  checkedAt: string;
  message?: string | null;
}

export interface LogMonitoringStats {
  total: number;
  recent24h: number;
  byAction: Array<{
    action: string;
    count: number;
  }>;
  recentLogs: SystemLogEntry[];
}

export interface MonitoringOverview {
  generatedAt: string;
  services: ServiceHealthSnapshot[];
  summary: {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    uptimePercent: number;
  };
  logs: LogMonitoringStats;
}
