import prisma from "../config/db.js";
import type { Admission } from "../interfaces/Admission.js";

export type AdmissionStatusValue = "PENDING" | "APPROVED" | "REJECTED";

export type CreateAdmissionInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  programId: number;
  message?: string;
};

export type UpdateAdmissionInput = Partial<CreateAdmissionInput> & {
  status?: AdmissionStatusValue;
  reviewedById?: number;
};

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
} as const;

function requireAdmissionFields(payload: CreateAdmissionInput) {
  if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone || !payload.programId) {
    throw new Error("firstName, lastName, email, phone, and programId are required");
  }
}

async function ensureProgramExists(programId: number) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { id: true },
  });

  if (!program) {
    throw new Error("Program not found.");
  }
}

function normalizeText(value?: string) {
  return value?.trim() || null;
}

export const admissionService = {
  async listAdmissions(): Promise<Admission[]> {
    return prisma.admissionRequest.findMany({
      select: admissionSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async getAdmissionById(id: number): Promise<Admission | null> {
    return prisma.admissionRequest.findUnique({
      where: { id },
      select: admissionSelect,
    });
  },

  async createAdmission(payload: CreateAdmissionInput): Promise<Admission> {
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

  async updateAdmission(id: number, payload: UpdateAdmissionInput): Promise<Admission | null> {
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

    const data: Record<string, unknown> = {};

    if (payload.firstName !== undefined) data.firstName = payload.firstName.trim();
    if (payload.lastName !== undefined) data.lastName = payload.lastName.trim();
    if (payload.email !== undefined) data.email = payload.email.toLowerCase().trim();
    if (payload.phone !== undefined) data.phone = payload.phone.trim();
    if (payload.programId !== undefined) data.programId = payload.programId;
    if (payload.message !== undefined) data.message = normalizeText(payload.message);
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.reviewedById !== undefined) data.reviewedById = payload.reviewedById;

    return prisma.admissionRequest.update({
      where: { id },
      data,
      select: admissionSelect,
    });
  },

  async deleteAdmission(id: number): Promise<boolean> {
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
