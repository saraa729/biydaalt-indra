import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
const STUDENT_ROLE_NAME = 'STUDENT';
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
};
async function getStudentRoleId() {
    const role = await prisma.role.findUnique({
        where: { name: STUDENT_ROLE_NAME },
        select: { id: true },
    });
    if (!role) {
        throw new Error('STUDENT role is missing from the database. Run the seed script first.');
    }
    return role.id;
}
function requireStudentFields(payload) {
    if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
        throw new Error('email, password, firstName, and lastName are required');
    }
}
function mapStudent(user) {
    return {
        ...user,
        phone: user.phone ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
    };
}
export const studentService = {
    async listStudents() {
        const students = await prisma.user.findMany({
            where: { role: { name: STUDENT_ROLE_NAME } },
            select: studentSelect,
            orderBy: { createdAt: 'desc' },
        });
        return students.map(mapStudent);
    },
    async getStudentById(id) {
        const student = await prisma.user.findFirst({
            where: { id, role: { name: STUDENT_ROLE_NAME } },
            select: studentSelect,
        });
        return student ? mapStudent(student) : null;
    },
    async createStudent(payload) {
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
    async updateStudent(id, payload) {
        const existing = await prisma.user.findFirst({
            where: { id, role: { name: STUDENT_ROLE_NAME } },
            select: { id: true },
        });
        if (!existing) {
            return null;
        }
        const data = {};
        if (payload.email !== undefined)
            data.email = payload.email.toLowerCase();
        if (payload.firstName !== undefined)
            data.firstName = payload.firstName.trim();
        if (payload.lastName !== undefined)
            data.lastName = payload.lastName.trim();
        if (payload.phone !== undefined)
            data.phone = payload.phone?.trim() || null;
        if (payload.avatarUrl !== undefined)
            data.avatarUrl = payload.avatarUrl?.trim() || null;
        if (payload.isActive !== undefined)
            data.isActive = payload.isActive;
        if (payload.password)
            data.password = await bcrypt.hash(payload.password, 10);
        const student = await prisma.user.update({
            where: { id },
            data,
            select: studentSelect,
        });
        return mapStudent(student);
    },
    async deleteStudent(id) {
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
