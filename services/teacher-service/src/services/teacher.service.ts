import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import type { Teacher } from '../interfaces/Teacher.js';

const TEACHER_ROLE_NAME = 'TEACHER' as const;

export type CreateTeacherInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
};

const teacherSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function getTeacherRoleId(): Promise<number> {
  const role = await prisma.role.findUnique({
    where: { name: TEACHER_ROLE_NAME },
    select: { id: true },
  });

  if (!role) {
    throw new Error('TEACHER role is missing from the database. Run the seed script first.');
  }

  return role.id;
}

function requireTeacherFields(payload: CreateTeacherInput) {
  if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
    throw new Error('email, password, firstName, and lastName are required');
  }
}

function mapTeacher(user: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Teacher {
  return {
    ...user,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export const teacherService = {
  async listTeachers(): Promise<Teacher[]> {
    const teachers = await prisma.user.findMany({
      where: { role: { name: TEACHER_ROLE_NAME } },
      select: teacherSelect,
      orderBy: { createdAt: 'desc' },
    });

    return teachers.map(mapTeacher);
  },

  async getTeacherById(id: number): Promise<Teacher | null> {
    const teacher = await prisma.user.findFirst({
      where: { id, role: { name: TEACHER_ROLE_NAME } },
      select: teacherSelect,
    });

    return teacher ? mapTeacher(teacher) : null;
  },

  async createTeacher(payload: CreateTeacherInput): Promise<Teacher> {
    requireTeacherFields(payload);
    const roleId = await getTeacherRoleId();
    const password = await bcrypt.hash(payload.password, 10);

    const teacher = await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        password,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        phone: payload.phone?.trim() || null,
        avatarUrl: payload.avatarUrl?.trim() || null,
        isActive: payload.isActive ?? true,
        roleId,
      },
      select: teacherSelect,
    });

    return mapTeacher(teacher);
  },

  async updateTeacher(id: number, payload: Partial<CreateTeacherInput>): Promise<Teacher | null> {
    const existing = await prisma.user.findFirst({
      where: { id, role: { name: TEACHER_ROLE_NAME } },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};
    if (payload.email !== undefined) data.email = payload.email.toLowerCase();
    if (payload.firstName !== undefined) data.firstName = payload.firstName.trim();
    if (payload.lastName !== undefined) data.lastName = payload.lastName.trim();
    if (payload.phone !== undefined) data.phone = payload.phone?.trim() || null;
    if (payload.avatarUrl !== undefined) data.avatarUrl = payload.avatarUrl?.trim() || null;
    if (payload.isActive !== undefined) data.isActive = payload.isActive;
    if (payload.password) data.password = await bcrypt.hash(payload.password, 10);

    const teacher = await prisma.user.update({
      where: { id },
      data,
      select: teacherSelect,
    });

    return mapTeacher(teacher);
  },

  async deleteTeacher(id: number): Promise<boolean> {
    const existing = await prisma.user.findFirst({
      where: { id, role: { name: TEACHER_ROLE_NAME } },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.user.delete({ where: { id } });
    return true;
  },
};
