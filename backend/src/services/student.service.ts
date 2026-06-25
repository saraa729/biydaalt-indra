import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import type { Student } from '../interfaces/Student.js';

const STUDENT_ROLE_NAME = 'STUDENT' as const;

export type CreateStudentInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
};

const studentSelect = {
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

async function getStudentRoleId(): Promise<number> {
  const role = await prisma.role.findUnique({
    where: { name: STUDENT_ROLE_NAME },
    select: { id: true },
  });

  if (!role) {
    throw new Error('STUDENT role is missing from the database. Run the seed script first.');
  }

  return role.id;
}

function requireStudentFields(payload: CreateStudentInput) {
  if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
    throw new Error('email, password, firstName, and lastName are required');
  }
}

function mapStudent(user: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Student {
  return {
    ...user,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export const studentService = {
  async listStudents(): Promise<Student[]> {
    const students = await prisma.user.findMany({
      where: { role: { name: STUDENT_ROLE_NAME } },
      select: studentSelect,
      orderBy: { createdAt: 'desc' },
    });

    return students.map(mapStudent);
  },

  async getStudentById(id: number): Promise<Student | null> {
    const student = await prisma.user.findFirst({
      where: { id, role: { name: STUDENT_ROLE_NAME } },
      select: studentSelect,
    });

    return student ? mapStudent(student) : null;
  },

  async createStudent(payload: CreateStudentInput): Promise<Student> {
    requireStudentFields(payload);
    const roleId = await getStudentRoleId();
    const password = await bcrypt.hash(payload.password, 10);

    const student = await prisma.user.create({
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
      select: studentSelect,
    });

    return mapStudent(student);
  },

  async updateStudent(id: number, payload: Partial<CreateStudentInput>): Promise<Student | null> {
    const existing = await prisma.user.findFirst({
      where: { id, role: { name: STUDENT_ROLE_NAME } },
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

    const student = await prisma.user.update({
      where: { id },
      data,
      select: studentSelect,
    });

    return mapStudent(student);
  },

  async deleteStudent(id: number): Promise<boolean> {
    const existing = await prisma.user.findFirst({
      where: { id, role: { name: STUDENT_ROLE_NAME } },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.user.delete({ where: { id } });
    return true;
  },
};
