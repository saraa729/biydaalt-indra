import prisma from "../config/db.js";
const admissionSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    programId: true,
    message: true,
    status: true,
    reviewedById: true,
    createdAt: true,
    updatedAt: true,
    program: {
        select: {
            id: true,
            name: true,
        },
    },
    reviewedBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};
function requireAdmissionFields(payload) {
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone || !payload.programId) {
        throw new Error("firstName, lastName, email, phone, and programId are required");
    }
}
async function ensureProgramExists(programId) {
    const program = await prisma.program.findUnique({
        where: { id: programId },
        select: { id: true },
    });
    if (!program) {
        throw new Error("Program not found.");
    }
}
function normalizeText(value) {
    return value?.trim() || null;
}
export const admissionService = {
    async listAdmissions() {
        return prisma.admissionRequest.findMany({
            select: admissionSelect,
            orderBy: { createdAt: "desc" },
        });
    },
    async getAdmissionById(id) {
        return prisma.admissionRequest.findUnique({
            where: { id },
            select: admissionSelect,
        });
    },
    async createAdmission(payload) {
        requireAdmissionFields(payload);
        await ensureProgramExists(payload.programId);
        return prisma.admissionRequest.create({
            data: {
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                email: payload.email.toLowerCase().trim(),
                phone: payload.phone.trim(),
                programId: payload.programId,
                message: normalizeText(payload.message),
                status: "PENDING",
            },
            select: admissionSelect,
        });
    },
    async updateAdmission(id, payload) {
        const existing = await prisma.admissionRequest.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return null;
        }
        if (payload.programId !== undefined) {
            await ensureProgramExists(payload.programId);
        }
        const data = {};
        if (payload.firstName !== undefined)
            data.firstName = payload.firstName.trim();
        if (payload.lastName !== undefined)
            data.lastName = payload.lastName.trim();
        if (payload.email !== undefined)
            data.email = payload.email.toLowerCase().trim();
        if (payload.phone !== undefined)
            data.phone = payload.phone.trim();
        if (payload.programId !== undefined)
            data.programId = payload.programId;
        if (payload.message !== undefined)
            data.message = normalizeText(payload.message);
        if (payload.status !== undefined)
            data.status = payload.status;
        if (payload.reviewedById !== undefined)
            data.reviewedById = payload.reviewedById;
        return prisma.admissionRequest.update({
            where: { id },
            data,
            select: admissionSelect,
        });
    },
    async deleteAdmission(id) {
        const existing = await prisma.admissionRequest.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return false;
        }
        await prisma.admissionRequest.delete({ where: { id } });
        return true;
    },
};
