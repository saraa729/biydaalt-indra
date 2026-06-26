import prisma from "../config/db.js";
import bcrypt from "bcrypt";
export const getAllUsers = async () => {
    return await prisma.user.findMany({
        include: { role: true },
    });
};
export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        include: { role: true },
    });
};
export const createUser = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
        },
        include: { role: true },
    });
};
export const updateUser = async (id, data) => {
    const updateData = { ...data };
    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }
    return await prisma.user.update({
        where: { id },
        data: updateData,
        include: { role: true },
    });
};
export const deleteUser = async (id) => {
    return await prisma.user.delete({
        where: { id },
    });
};
export const getAllRoles = async () => {
    return await prisma.role.findMany();
};
