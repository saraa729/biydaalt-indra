import prisma from "../config/db.js";
const gradeSelect = {
    id: true,
    classGroupId: true,
    studentId: true,
    givenById: true,
    title: true,
    score: true,
    maxScore: true,
    comment: true,
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
    givenBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};
function requireGradeFields(payload) {
    if (!payload.classGroupId || !payload.studentId || !payload.givenById || !payload.title) {
        throw new Error("classGroupId, studentId, givenById, and title are required");
    }
}
export const gradeService = {
    async listGrades(filters = {}) {
        return prisma.grade.findMany({
            where: {
                classGroupId: filters.classGroupId,
                studentId: filters.studentId,
                givenById: filters.givenById,
            },
            select: gradeSelect,
            orderBy: [{ createdAt: "desc" }],
        });
    },
    async getGradeById(id) {
        return prisma.grade.findUnique({
            where: { id },
            select: gradeSelect,
        });
    },
    async getMyGrades(studentId) {
        return this.listGrades({ studentId });
    },
    async createGrade(payload) {
        requireGradeFields(payload);
        return prisma.grade.create({
            data: {
                classGroupId: payload.classGroupId,
                studentId: payload.studentId,
                givenById: payload.givenById,
                title: payload.title.trim(),
                score: payload.score,
                maxScore: payload.maxScore ?? 100,
                comment: payload.comment?.trim() || null,
            },
            select: gradeSelect,
        });
    },
    async updateGrade(id, payload) {
        const existing = await prisma.grade.findUnique({
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
        if (payload.givenById !== undefined)
            data.givenById = payload.givenById;
        if (payload.title !== undefined)
            data.title = payload.title.trim();
        if (payload.score !== undefined)
            data.score = payload.score;
        if (payload.maxScore !== undefined)
            data.maxScore = payload.maxScore;
        if (payload.comment !== undefined)
            data.comment = payload.comment?.trim() || null;
        return prisma.grade.update({
            where: { id },
            data,
            select: gradeSelect,
        });
    },
    async deleteGrade(id) {
        const existing = await prisma.grade.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return false;
        }
        await prisma.grade.delete({ where: { id } });
        return true;
    },
};
