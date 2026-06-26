import prisma from "../config/db.js";
const attendanceSelect = {
    id: true,
    classGroupId: true,
    studentId: true,
    date: true,
    status: true,
    takenById: true,
    createdAt: true,
    classGroup: {
        select: {
            id: true,
            name: true,
        },
    },
    student: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
    takenBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};
function normalizeStatus(value) {
    if (!value) {
        return "PRESENT";
    }
    const status = value.toUpperCase();
    if (status === "PRESENT" || status === "ABSENT" || status === "LATE" || status === "EXCUSED") {
        return status;
    }
    throw new Error("Invalid attendance status.");
}
function requireAttendanceFields(payload) {
    if (!payload.classGroupId || !payload.studentId || !payload.date || !payload.takenById) {
        throw new Error("classGroupId, studentId, date, and takenById are required");
    }
}
export const attendanceService = {
    async listAttendances(filters = {}) {
        return prisma.attendance.findMany({
            where: {
                classGroupId: filters.classGroupId,
                studentId: filters.studentId,
                takenById: filters.takenById,
            },
            select: attendanceSelect,
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        });
    },
    async getAttendanceById(id) {
        return prisma.attendance.findUnique({
            where: { id },
            select: attendanceSelect,
        });
    },
    async getMyAttendances(studentId) {
        return this.listAttendances({ studentId });
    },
    async recordAttendance(payload) {
        requireAttendanceFields(payload);
        const existing = await prisma.attendance.findUnique({
            where: {
                classGroupId_studentId_date: {
                    classGroupId: payload.classGroupId,
                    studentId: payload.studentId,
                    date: payload.date,
                },
            },
            select: { id: true },
        });
        if (existing) {
            return prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    status: payload.status,
                    takenById: payload.takenById,
                },
                select: attendanceSelect,
            });
        }
        return prisma.attendance.create({
            data: {
                classGroupId: payload.classGroupId,
                studentId: payload.studentId,
                date: payload.date,
                status: normalizeStatus(payload.status),
                takenById: payload.takenById,
            },
            select: attendanceSelect,
        });
    },
    async updateAttendance(id, payload) {
        const existing = await prisma.attendance.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return null;
        }
        const data = {};
        if (payload.classGroupId !== undefined)
            data.classGroupId = payload.classGroupId;
        if (payload.studentId !== undefined)
            data.studentId = payload.studentId;
        if (payload.date !== undefined)
            data.date = payload.date;
        if (payload.status !== undefined)
            data.status = normalizeStatus(payload.status);
        if (payload.takenById !== undefined)
            data.takenById = payload.takenById;
        return prisma.attendance.update({
            where: { id },
            data,
            select: attendanceSelect,
        });
    },
    async deleteAttendance(id) {
        const existing = await prisma.attendance.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return false;
        }
        await prisma.attendance.delete({ where: { id } });
        return true;
    },
};
