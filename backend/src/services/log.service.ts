import prisma from "../config/db.js";
import type { SystemLogEntry } from "../interfaces/SystemLog.js";

export type CreateSystemLogInput = {
  action: string;
  details?: string;
  userId?: number | null;
  ipAddress?: string | null;
};

export type ListSystemLogsFilters = {
  limit?: number;
  action?: string;
  search?: string;
  userId?: number;
  from?: Date;
  to?: Date;
  ipAddress?: string;
};

export type SystemLogStats = {
  total: number;
  byAction: Array<{
    action: string;
    count: number;
  }>;
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

function buildWhere(filters: Omit<ListSystemLogsFilters, "limit"> = {}) {
  const action = filters.action?.trim();
  const search = filters.search?.trim();

  return {
    userId: filters.userId,
    ipAddress: filters.ipAddress?.trim(),
    action: action
      ? {
          contains: action,
        }
      : undefined,
    createdAt:
      filters.from || filters.to
        ? {
            gte: filters.from,
            lte: filters.to,
          }
        : undefined,
    OR: search
      ? [
          {
            action: {
              contains: search,
            },
          },
          {
            details: {
              contains: search,
            },
          },
          {
            ipAddress: {
              contains: search,
            },
          },
          {
            user: {
              is: {
                firstName: {
                  contains: search,
                },
              },
            },
          },
          {
            user: {
              is: {
                lastName: {
                  contains: search,
                },
              },
            },
          },
          {
            user: {
              is: {
                email: {
                  contains: search,
                },
              },
            },
          },
        ]
      : undefined,
  };
}

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

  async listSystemLogs(filters: ListSystemLogsFilters = {}): Promise<SystemLogEntry[]> {
    const limit = filters.limit ?? 100;

    return prisma.systemLog.findMany({
      take: limit,
      where: buildWhere(filters),
      orderBy: { createdAt: "desc" },
      select: logSelect,
    });
  },

  async countSystemLogs(filters: Omit<ListSystemLogsFilters, "limit"> = {}) {
    return prisma.systemLog.count({
      where: buildWhere(filters),
    });
  },

  async getSystemLogStats(filters: Omit<ListSystemLogsFilters, "limit"> = {}): Promise<SystemLogStats> {
    const where = buildWhere(filters);

    const [total, groupedByAction] = await Promise.all([
      prisma.systemLog.count({ where }),
      prisma.systemLog.groupBy({
        by: ["action"],
        where,
        _count: {
          action: true,
        },
      }),
    ]);

    return {
      total,
      byAction: groupedByAction
        .map((row: { action: string; _count: { action: number } }) => ({
          action: row.action,
          count: row._count.action,
        }))
        .sort((left: { action: string; count: number }, right: { action: string; count: number }) => right.count - left.count),
    };
  },
};
