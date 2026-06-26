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
    async listSystemLogs(limit = 100) {
        return prisma.systemLog.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            select: logSelect,
        });
    },
};
