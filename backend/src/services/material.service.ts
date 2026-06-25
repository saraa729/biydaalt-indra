import prisma from '../config/db.js';
import type { Material } from '../interfaces/Material.js';

export type CreateMaterialInput = {
  title: string;
  fileUrl: string;
  fileType?: string;
  classGroupId: number;
  uploadedById: number;
};

function requireMaterialFields(payload: CreateMaterialInput) {
  if (!payload.title || !payload.fileUrl || !payload.classGroupId || !payload.uploadedById) {
    throw new Error('title, fileUrl, classGroupId, and uploadedById are required');
  }
}

const materialSelect = {
  id: true,
  title: true,
  fileUrl: true,
  fileType: true,
  classGroupId: true,
  uploadedById: true,
  createdAt: true,
} as const;

export const materialService = {
  async listMaterials(): Promise<Material[]> {
    return prisma.material.findMany({
      select: materialSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getMaterialById(id: number): Promise<Material | null> {
    return prisma.material.findUnique({
      where: { id },
      select: materialSelect,
    });
  },

  async createMaterial(payload: CreateMaterialInput): Promise<Material> {
    requireMaterialFields(payload);
    return prisma.material.create({
      data: {
        title: payload.title.trim(),
        fileUrl: payload.fileUrl.trim(),
        fileType: payload.fileType?.trim() || null,
        classGroupId: payload.classGroupId,
        uploadedById: payload.uploadedById,
      },
      select: materialSelect,
    });
  },

  async updateMaterial(id: number, payload: Partial<CreateMaterialInput>): Promise<Material | null> {
    const existing = await prisma.material.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};
    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.fileUrl !== undefined) data.fileUrl = payload.fileUrl.trim();
    if (payload.fileType !== undefined) data.fileType = payload.fileType?.trim() || null;
    if (payload.classGroupId !== undefined) data.classGroupId = payload.classGroupId;
    if (payload.uploadedById !== undefined) data.uploadedById = payload.uploadedById;

    return prisma.material.update({
      where: { id },
      data,
      select: materialSelect,
    });
  },

  async deleteMaterial(id: number): Promise<boolean> {
    const existing = await prisma.material.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.material.delete({ where: { id } });
    return true;
  },
};
