import prisma from "../config/db.js";
import type { SystemLogEntry } from "../interfaces/SystemLog.js";

export type CreateSystemLogInput = {
  action: string;
  details?: string;
  userId?: number | null;
  ipAddress?: string | null;
};

const logSelect = {
  id: true,
  userId: true,
  action: true,
  details: true,
  ipAddress: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

export const logService = {
  async createSystemLog(payload: CreateSystemLogInput): Promise<SystemLogEntry | null> {
    try {
      return await prisma.systemLog.create({
        data: {
          userId: payload.userId ?? null,
          action: payload.action,
          details: payload.details ?? null,
          ipAddress: payload.ipAddress ?? null,
        },
        select: logSelect,
      });
    } catch (error) {
      console.error("Failed to write system log:", error);
      return null;
    }
  },

  async listSystemLogs(limit = 100): Promise<SystemLogEntry[]> {
    return prisma.systemLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: logSelect,
    });
  },
};
