import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { signJwt } from "../middlewares/auth.middleware.js";
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
};
const authUserSelect = {
    ...publicUserSelect,
    password: true,
};
function normalizeEmail(email) {
    return email.toLowerCase().trim();
}
function normalizeUser(user) {
    return {
        ...user,
        phone: user.phone ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
    };
}
function requireLoginFields(email, password) {
    if (!email || !password) {
        throw new Error("email and password are required");
    }
}
function requireRegisterFields(data) {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new Error("email, password, firstName, and lastName are required");
    }
}
function issueToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not configured");
    }
    return signJwt({ id: userId }, secret);
}
async function findUserByEmail(email) {
    return (await prisma.user.findUnique({
        where: { email },
        select: authUserSelect,
    }));
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
export const login = async (email, password) => {
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
export const register = async (data) => {
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
    }));
    const token = issueToken(user.id);
    return { user: normalizeUser(user), token };
};
export const verifyToken = async (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not configured");
    }
    const { verifyJwt } = await import("../middlewares/auth.middleware.js");
    const decoded = verifyJwt(token, secret);
    const user = (await prisma.user.findUnique({
        where: { id: decoded.id },
        select: publicUserSelect,
    }));
    if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
    }
    return normalizeUser(user);
};
