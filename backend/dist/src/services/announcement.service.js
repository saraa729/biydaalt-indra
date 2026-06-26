import prisma from "../config/db.js";
const announcementSelect = {
    id: true,
    title: true,
    content: true,
    isPublished: true,
    authorId: true,
    createdAt: true,
    updatedAt: true,
    author: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};
function requireAnnouncementFields(payload) {
    if (!payload.title || !payload.content || !payload.authorId) {
        throw new Error("title, content, and authorId are required");
    }
}
export const announcementService = {
    async listAnnouncements() {
        return prisma.announcement.findMany({
            select: announcementSelect,
            orderBy: { createdAt: "desc" },
        });
    },
    async getAnnouncementById(id) {
        return prisma.announcement.findUnique({
            where: { id },
            select: announcementSelect,
        });
    },
    async createAnnouncement(payload) {
        requireAnnouncementFields(payload);
        return prisma.announcement.create({
            data: {
                title: payload.title.trim(),
                content: payload.content.trim(),
                isPublished: payload.isPublished ?? false,
                authorId: payload.authorId,
            },
            select: announcementSelect,
        });
    },
    async updateAnnouncement(id, payload) {
        const existing = await prisma.announcement.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return null;
        }
        const data = {};
        if (payload.title !== undefined)
            data.title = payload.title.trim();
        if (payload.content !== undefined)
            data.content = payload.content.trim();
        if (payload.isPublished !== undefined)
            data.isPublished = payload.isPublished;
        return prisma.announcement.update({
            where: { id },
            data,
            select: announcementSelect,
        });
    },
    async deleteAnnouncement(id) {
        const existing = await prisma.announcement.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return false;
        }
        await prisma.announcement.delete({ where: { id } });
        return true;
    },
};
