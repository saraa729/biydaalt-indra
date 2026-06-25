import prisma from '../config/db.js';
function requireProgramFields(payload) {
    if (!payload.name) {
        throw new Error('name is required');
    }
}
const programSelect = {
    id: true,
    name: true,
    description: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
export const programService = {
    async listPrograms() {
        return prisma.program.findMany({
            select: programSelect,
            orderBy: { createdAt: 'desc' },
        });
    },
    async getProgramById(id) {
        return prisma.program.findUnique({
            where: { id },
            select: programSelect,
        });
    },
    async createProgram(payload) {
        requireProgramFields(payload);
        return prisma.program.create({
            data: {
                name: payload.name.trim(),
                description: payload.description?.trim() || null,
                isActive: payload.isActive ?? true,
            },
            select: programSelect,
        });
    },
    async updateProgram(id, payload) {
        const existing = await prisma.program.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return null;
        }
        const data = {};
        if (payload.name !== undefined)
            data.name = payload.name.trim();
        if (payload.description !== undefined)
            data.description = payload.description?.trim() || null;
        if (payload.isActive !== undefined)
            data.isActive = payload.isActive;
        return prisma.program.update({
            where: { id },
            data,
            select: programSelect,
        });
    },
    async deleteProgram(id) {
        const existing = await prisma.program.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return false;
        }
        await prisma.program.delete({ where: { id } });
        return true;
    },
};
