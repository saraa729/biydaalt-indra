import { logService } from "./log.service.js";
import type { LogMonitoringStats, MonitoringOverview, ServiceHealthSnapshot } from "../interfaces/Monitoring.js";

type MonitoringTarget = {
  name: string;
  baseUrl: string;
};

const DEFAULT_TIMEOUT_MS = Number(process.env.MONITORING_TIMEOUT_MS ?? 2500);
const RECENT_LOG_LIMIT = Number(process.env.MONITORING_RECENT_LOG_LIMIT ?? 10);

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, "");
}

function buildHealthUrl(baseUrl: string) {
  return new URL("/health", `${normalizeBaseUrl(baseUrl)}/`).toString();
}

function getTargets(): MonitoringTarget[] {
  return [
    { name: "Backend", baseUrl: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008" },
    { name: "Gateway", baseUrl: process.env.GATEWAY_SERVICE_URL ?? "http://api-gateway:3000" },
    { name: "Auth Service", baseUrl: process.env.AUTH_SERVICE_URL ?? "http://auth-service:3006" },
    { name: "User Service", baseUrl: process.env.USER_SERVICE_URL ?? "http://user-service:3007" },
    { name: "Student Service", baseUrl: process.env.STUDENT_SERVICE_URL ?? "http://student-service:3001" },
    { name: "Teacher Service", baseUrl: process.env.TEACHER_SERVICE_URL ?? "http://teacher-service:3002" },
    { name: "Program Service", baseUrl: process.env.PROGRAM_SERVICE_URL ?? "http://program-service:3003" },
    { name: "Material Service", baseUrl: process.env.MATERIAL_SERVICE_URL ?? "http://material-service:3004" },
    { name: "Contact Service", baseUrl: process.env.CONTACT_SERVICE_URL ?? "http://contact-service:3005" },
  ];
}

async function probeService(target: MonitoringTarget): Promise<ServiceHealthSnapshot> {
  const healthUrl = buildHealthUrl(target.baseUrl);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal,
    });

    const healthy = response.ok;

    return {
      name: target.name,
      url: normalizeBaseUrl(target.baseUrl),
      healthUrl,
      status: healthy ? "UP" : "DOWN",
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      message: healthy ? "Healthy" : `Unexpected status ${response.status}`,
    };
  } catch (error) {
    return {
      name: target.name,
      url: normalizeBaseUrl(target.baseUrl),
      healthUrl,
      status: "DOWN",
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Health check failed",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function buildLogStats(): Promise<LogMonitoringStats> {
  const recent24hFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, recent24h, recentLogs, stats] = await Promise.all([
    logService.countSystemLogs(),
    logService.countSystemLogs({ from: recent24hFrom }),
    logService.listSystemLogs({ limit: RECENT_LOG_LIMIT }),
    logService.getSystemLogStats(),
  ]);

  return {
    total,
    recent24h,
    byAction: stats.byAction,
    recentLogs,
  };
}

export const monitoringService = {
  async getServicesHealth(): Promise<ServiceHealthSnapshot[]> {
    const targets = getTargets();
    return Promise.all(targets.map((target) => probeService(target)));
  },

  async getOverview(): Promise<MonitoringOverview> {
    const services = await monitoringService.getServicesHealth();
    const logs = await buildLogStats();
    const totalServices = services.length;
    const healthyServices = services.filter((service) => service.status === "UP").length;
    const unhealthyServices = totalServices - healthyServices;
    const uptimePercent = totalServices > 0 ? Number(((healthyServices / totalServices) * 100).toFixed(2)) : 0;

    return {
      generatedAt: new Date().toISOString(),
      services,
      summary: {
        totalServices,
        healthyServices,
        unhealthyServices,
        uptimePercent,
      },
      logs,
    };
  },
};
