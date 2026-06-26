import prisma from "../config/db.js";
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
};
function buildWhere(filters = {}) {
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
        createdAt: filters.from || filters.to
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
    async createSystemLog(payload) {
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
        }
        catch (error) {
            console.error("Failed to write system log:", error);
            return null;
        }
    },
    async listSystemLogs(filters = {}) {
        const limit = filters.limit ?? 100;
        return prisma.systemLog.findMany({
            take: limit,
            where: buildWhere(filters),
            orderBy: { createdAt: "desc" },
            select: logSelect,
        });
    },
    async countSystemLogs(filters = {}) {
        return prisma.systemLog.count({
            where: buildWhere(filters),
        });
    },
    async getSystemLogStats(filters = {}) {
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
                .map((row) => ({
                action: row.action,
                count: row._count.action,
            }))
                .sort((left, right) => right.count - left.count),
        };
    },
};
