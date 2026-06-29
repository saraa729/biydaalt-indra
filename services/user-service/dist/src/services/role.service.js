import prisma from "../config/db.js";
const roleSelect = {
    id: true,
    name: true,
};
const allowedRoleNames = new Set([
    "SUPER_ADMIN",
    "OWNER",
    "DIRECTOR",
    "ACADEMIC_OFFICE",
    "MODERATOR",
    "TEACHER",
    "STUDENT",
]);
function normalizeRoleName(name) {
    const normalized = name.trim().toUpperCase();
    if (!allowedRoleNames.has(normalized)) {
        throw new Error("Invalid role name");
    }
    return normalized;
}
function requireRoleName(name) {
    if (!name) {
        throw new Error("name is required");
    }
}
export const listRoles = async () => {
    return prisma.role.findMany({
        select: roleSelect,
        orderBy: { id: "asc" },
    });
};
export const getRoleById = async (id) => {
    return prisma.role.findUnique({
        where: { id },
        select: roleSelect,
    });
};
export const createRole = async (data) => {
    requireRoleName(data.name);
    const name = normalizeRoleName(data.name);
    const existing = await prisma.role.findUnique({
        where: { name },
        select: { id: true },
    });
    if (existing) {
        throw new Error("Role already exists");
    }
    return prisma.role.create({
        data: { name },
        select: roleSelect,
    });
};
export const updateRole = async (id, data) => {
    const existing = await prisma.role.findUnique({
        where: { id },
        select: { id: true },
    });
    if (!existing) {
        return null;
    }
    requireRoleName(data.name);
    const name = normalizeRoleName(data.name ?? "");
    const duplicate = await prisma.role.findUnique({
        where: { name },
        select: { id: true },
    });
    if (duplicate && duplicate.id !== id) {
        throw new Error("Role already exists");
    }
    return prisma.role.update({
        where: { id },
        data: { name },
        select: roleSelect,
    });
};
export const deleteRole = async (id) => {
    const existing = await prisma.role.findUnique({
        where: { id },
        select: { id: true },
    });
    if (!existing) {
        return false;
    }
    const userCount = await prisma.user.count({
        where: { roleId: id },
    });
    if (userCount > 0) {
        throw new Error("Role is assigned to users and cannot be deleted");
    }
    await prisma.role.delete({
        where: { id },
    });
    return true;
};
