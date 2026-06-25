import prisma from '../config/db.js';
import type { Program } from '../interfaces/Program.js';

export type CreateProgramInput = {
  name: string;
  description?: string;
  isActive?: boolean;
};

function requireProgramFields(payload: CreateProgramInput) {
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
} as const;

export const programService = {
  async listPrograms(): Promise<Program[]> {
    return prisma.program.findMany({
      select: programSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getProgramById(id: number): Promise<Program | null> {
    return prisma.program.findUnique({
      where: { id },
      select: programSelect,
    });
  },

  async createProgram(payload: CreateProgramInput): Promise<Program> {
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

  async updateProgram(id: number, payload: Partial<CreateProgramInput>): Promise<Program | null> {
    const existing = await prisma.program.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};
    if (payload.name !== undefined) data.name = payload.name.trim();
    if (payload.description !== undefined) data.description = payload.description?.trim() || null;
    if (payload.isActive !== undefined) data.isActive = payload.isActive;

    return prisma.program.update({
      where: { id },
      data,
      select: programSelect,
    });
  },

  async deleteProgram(id: number): Promise<boolean> {
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
