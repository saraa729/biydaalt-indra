import prisma from "../config/db.js";
import type { News } from "../interfaces/News.js";

export type CreateNewsInput = {
  title: string;
  content: string;
  imageUrl?: string;
  isPublished?: boolean;
  authorId: number;
};

export type UpdateNewsInput = Partial<Omit<CreateNewsInput, "authorId">>;

const newsSelect = {
  id: true,
  title: true,
  content: true,
  imageUrl: true,
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

function requireNewsFields(payload: CreateNewsInput) {
  if (!payload.title || !payload.content || !payload.authorId) {
    throw new Error("title, content, and authorId are required");
  }
}

export const newsService = {
  async listNews(search?: string): Promise<News[]> {
    const keyword = search?.trim();

    return prisma.news.findMany({
      where: keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { content: { contains: keyword } },
            ],
          }
        : undefined,
      select: newsSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async getNewsById(id: number): Promise<News | null> {
    return prisma.news.findUnique({
      where: { id },
      select: newsSelect,
    });
  },

  async createNews(payload: CreateNewsInput): Promise<News> {
    requireNewsFields(payload);

    return prisma.news.create({
      data: {
        title: payload.title.trim(),
        content: payload.content.trim(),
        imageUrl: payload.imageUrl?.trim() || null,
        isPublished: payload.isPublished ?? false,
        authorId: payload.authorId,
      },
      select: newsSelect,
    });
  },

  async updateNews(id: number, payload: UpdateNewsInput): Promise<News | null> {
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};

    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.content !== undefined) data.content = payload.content.trim();
    if (payload.imageUrl !== undefined) data.imageUrl = payload.imageUrl?.trim() || null;
    if (payload.isPublished !== undefined) data.isPublished = payload.isPublished;
    return prisma.news.update({
      where: { id },
      data,
      select: newsSelect,
    });
  },

  async deleteNews(id: number): Promise<boolean> {
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.news.delete({ where: { id } });
    return true;
  },
};
