import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { signJwt } from "../middlewares/auth.middleware.js";

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

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

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  const token = signJwt({ id: user.id }, secret);

  return { user, token };
};

export const verifyToken = async (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  const { verifyJwt } = await import("../middlewares/auth.middleware.js");
  const decoded = verifyJwt(token, secret);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  return user;
};
