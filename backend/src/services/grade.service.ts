import prisma from "../config/db.js";
import type { GradeRecord } from "../interfaces/Grade.js";

export type CreateGradeInput = {
  classGroupId: number;
  studentId: number;
  givenById: number;
  title: string;
  score: number;
  maxScore?: number;
  comment?: string | null;
};

export type UpdateGradeInput = Partial<CreateGradeInput>;

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
} as const;

function requireGradeFields(payload: CreateGradeInput) {
  if (!payload.classGroupId || !payload.studentId || !payload.givenById || !payload.title) {
    throw new Error("classGroupId, studentId, givenById, and title are required");
  }
}

export const gradeService = {
  async listGrades(filters: {
    classGroupId?: number;
    studentId?: number;
    givenById?: number;
  } = {}): Promise<GradeRecord[]> {
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

  async getGradeById(id: number): Promise<GradeRecord | null> {
    return prisma.grade.findUnique({
      where: { id },
      select: gradeSelect,
    });
  },

  async getMyGrades(studentId: number): Promise<GradeRecord[]> {
    return this.listGrades({ studentId });
  },

  async createGrade(payload: CreateGradeInput): Promise<GradeRecord> {
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

  async updateGrade(id: number, payload: UpdateGradeInput): Promise<GradeRecord | null> {
    const existing = await prisma.grade.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};

    if (payload.classGroupId !== undefined) data.classGroupId = payload.classGroupId;
    if (payload.studentId !== undefined) data.studentId = payload.studentId;
    if (payload.givenById !== undefined) data.givenById = payload.givenById;
    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.score !== undefined) data.score = payload.score;
    if (payload.maxScore !== undefined) data.maxScore = payload.maxScore;
    if (payload.comment !== undefined) data.comment = payload.comment?.trim() || null;

    return prisma.grade.update({
      where: { id },
      data,
      select: gradeSelect,
    });
  },

  async deleteGrade(id: number): Promise<boolean> {
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
