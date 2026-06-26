import prisma from "../config/db.js";
import type { Announcement } from "../interfaces/Announcement.js";

export type CreateAnnouncementInput = {
  title: string;
  content: string;
  isPublished?: boolean;
  authorId: number;
};

export type UpdateAnnouncementInput = Partial<Omit<CreateAnnouncementInput, "authorId">>;

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
} as const;

function requireAnnouncementFields(payload: CreateAnnouncementInput) {
  if (!payload.title || !payload.content || !payload.authorId) {
    throw new Error("title, content, and authorId are required");
  }
}

export const announcementService = {
  async listAnnouncements(): Promise<Announcement[]> {
    return prisma.announcement.findMany({
      select: announcementSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async getAnnouncementById(id: number): Promise<Announcement | null> {
    return prisma.announcement.findUnique({
      where: { id },
      select: announcementSelect,
    });
  },

  async createAnnouncement(payload: CreateAnnouncementInput): Promise<Announcement> {
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

  async updateAnnouncement(
    id: number,
    payload: UpdateAnnouncementInput,
  ): Promise<Announcement | null> {
    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};

    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.content !== undefined) data.content = payload.content.trim();
    if (payload.isPublished !== undefined) data.isPublished = payload.isPublished;
    return prisma.announcement.update({
      where: { id },
      data,
      select: announcementSelect,
    });
  },

  async deleteAnnouncement(id: number): Promise<boolean> {
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
