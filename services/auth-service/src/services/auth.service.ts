import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { signJwt } from "../middlewares/auth.middleware.js";

type UserRecord = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: number;
    name: string;
  };
};

type AuthUser = UserRecord & {
  password: string;
};

const publicUserSelect = {
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

const authUserSelect = {
  ...publicUserSelect,
  password: true,
} as const;

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function normalizeUser(user: UserRecord): UserRecord {
  return {
    ...user,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

function requireLoginFields(email?: string, password?: string) {
  if (!email || !password) {
    throw new Error("email and password are required");
  }
}

function requireRegisterFields(data: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    throw new Error("email, password, firstName, and lastName are required");
  }
}

function issueToken(userId: number) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return signJwt({ id: userId }, secret);
}

async function findUserByEmail(email: string) {
  return (await prisma.user.findUnique({
    where: { email },
    select: authUserSelect,
  })) as AuthUser | null;
}

async function getStudentRoleId() {
  const studentRole = await prisma.role.findUnique({
    where: { name: "STUDENT" },
    select: { id: true },
  });

  if (!studentRole) {
    throw new Error("STUDENT role is missing from the database");
  }

  return studentRole.id;
}

export const login = async (email: string, password: string) => {
  requireLoginFields(email, password);

  const user = await findUserByEmail(normalizeEmail(email));

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  const token = issueToken(user.id);

  return { user: normalizeUser(user), token };
};

export const register = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}) => {
  requireRegisterFields(data);

  const email = normalizeEmail(data.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const studentRoleId = await getStudentRoleId();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = (await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone?.trim() || null,
      avatarUrl: data.avatarUrl?.trim() || null,
      roleId: studentRoleId,
    },
    select: publicUserSelect,
  })) as UserRecord;

  const token = issueToken(user.id);

  return { user: normalizeUser(user), token };
};

export const verifyToken = async (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  const { verifyJwt } = await import("../middlewares/auth.middleware.js");
  const decoded = verifyJwt(token, secret);

  const user = (await prisma.user.findUnique({
    where: { id: decoded.id },
    select: publicUserSelect,
  })) as UserRecord | null;

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  return normalizeUser(user);
};
