import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { signJwt } from "../utils/jwt.js";

type AuthUser = {
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

type PublicUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  role: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

const registerSelect = {
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

const publicUserSelect = registerSelect;

function requireRegisterFields(payload: RegisterInput) {
  if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
    throw new Error("email, password, firstName, and lastName are required");
  }
}

function normalizeUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    isActive: user.isActive,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function issueToken(userId: number) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return signJwt({ id: userId }, secret);
}

async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
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
    },
  });
}

async function getStudentRoleId() {
  const role = await prisma.role.findUnique({
    where: { name: "STUDENT" },
    select: { id: true },
  });

  if (!role) {
    throw new Error("STUDENT role is missing from the database. Run the seed script first.");
  }

  return role.id;
}

export const authService = {
  async register(payload: RegisterInput) {
    requireRegisterFields(payload);

    const email = payload.email.toLowerCase().trim();
    const existing = await findUserByEmail(email);

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const roleId = await getStudentRoleId();
    const password = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        phone: payload.phone?.trim() || null,
        avatarUrl: payload.avatarUrl?.trim() || null,
        roleId,
      },
      select: publicUserSelect,
    });

    const token = issueToken(user.id);

    return {
      user: normalizeUser(user as AuthUser),
      token,
    };
  },

  async login(payload: LoginInput) {
    if (!payload.email || !payload.password) {
      throw new Error("email and password are required");
    }

    const email = payload.email.toLowerCase().trim();
    const user = await findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.password);

    if (!passwordMatches) {
      throw new Error("Invalid email or password.");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive.");
    }

    const token = issueToken(user.id);

    return {
      user: normalizeUser(user),
      token,
    };
  },

  async me(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: registerSelect,
    });

    return user ? normalizeUser(user as AuthUser) : null;
  },
};
