import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import type { CreateUserRequest, UpdateUserRequest, UserRecord } from "../interfaces/User.js";
import type { RoleRecord } from "../interfaces/Role.js";

type UserRow = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: number;
    name: string;
  };
};

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const roleSelect = {
  id: true,
  name: true,
} as const;

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function parseRoleId(value: unknown) {
  const roleId = Number(value);
  if (!Number.isInteger(roleId) || roleId <= 0) {
    throw new Error("roleId is required");
  }
  return roleId;
}

function requireUserFields(data: CreateUserRequest) {
  if (!data.email || !data.password || !data.firstName || !data.lastName || !data.roleId) {
    throw new Error("email, password, firstName, lastName, and roleId are required");
  }
}

function mapUser(user: UserRow): UserRecord {
  return {
    ...user,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

async function requireRole(roleId: number) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  return role.id;
}

export const getAllUsers = async (): Promise<UserRecord[]> => {
  const users = (await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  })) as UserRow[];

  return users.map(mapUser);
};

export const getUserById = async (id: number): Promise<UserRecord | null> => {
  const user = (await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  })) as UserRow | null;

  return user ? mapUser(user) : null;
};

export const createUser = async (data: CreateUserRequest): Promise<UserRecord> => {
  requireUserFields(data);

  const email = normalizeEmail(data.email);
  const roleId = parseRoleId(data.roleId);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  await requireRole(roleId);

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = (await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone?.trim() || null,
      avatarUrl: data.avatarUrl?.trim() || null,
      roleId,
    },
    select: userSelect,
  })) as UserRow;

  return mapUser(user);
};

export const updateUser = async (
  id: number,
  data: UpdateUserRequest,
): Promise<UserRecord | null> => {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updateData: Record<string, unknown> = {};

  if (data.email !== undefined) {
    const email = normalizeEmail(data.email);
    const duplicate = await prisma.user.findFirst({
      where: {
        email,
        id: {
          not: id,
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new Error("A user with this email already exists");
    }

    updateData.email = email;
  }

  if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
  if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
  if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl?.trim() || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  if (data.roleId !== undefined) {
    const roleId = parseRoleId(data.roleId);
    await requireRole(roleId);
    updateData.roleId = roleId;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = (await prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelect,
  })) as UserRow;

  return mapUser(user);
};

export const deleteUser = async (id: number) => {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return false;
  }

  await prisma.user.delete({
    where: { id },
  });

  return true;
};

export const getAllRoles = async (): Promise<RoleRecord[]> => {
  return prisma.role.findMany({
    select: roleSelect,
    orderBy: { id: "asc" },
  });
};
