import fs from "node:fs/promises";
import path from "node:path";
import prisma from "../config/db.js";
const backupDir = path.resolve(process.cwd(), "backups");
let schedulerStarted = false;
const backupSelect = {
    id: true,
    email: true,
    password: true,
    firstName: true,
    lastName: true,
    phone: true,
    avatarUrl: true,
    isActive: true,
    roleId: true,
    createdAt: true,
    updatedAt: true,
};
async function ensureBackupDir() {
    await fs.mkdir(backupDir, { recursive: true });
}
function assertBackupFileName(fileName) {
    const normalized = path.basename(fileName);
    if (normalized !== fileName || !fileName.startsWith("backup-") || !fileName.endsWith(".json")) {
        throw new Error("Invalid backup file name.");
    }
}
function toSerializableDate(value) {
    return value instanceof Date ? value.toISOString() : value;
}
async function readJsonFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
}
async function loadBackupPayload(fileName) {
    assertBackupFileName(fileName);
    await ensureBackupDir();
    const filePath = path.join(backupDir, fileName);
    const payload = await readJsonFile(filePath);
    return { filePath, payload };
}
async function writeBackupSnapshot(reason, triggeredById) {
    await ensureBackupDir();
    const snapshot = {
        meta: {
            generatedAt: new Date().toISOString(),
            reason,
            triggeredById: triggeredById ?? null,
        },
        roles: await prisma.role.findMany({ orderBy: { id: "asc" } }),
        users: await prisma.user.findMany({ orderBy: { id: "asc" }, select: backupSelect }),
        programs: await prisma.program.findMany({ orderBy: { id: "asc" } }),
        classGroups: await prisma.classGroup.findMany({ orderBy: { id: "asc" } }),
        schedules: await prisma.schedule.findMany({ orderBy: { id: "asc" } }),
        enrollments: await prisma.enrollment.findMany({ orderBy: { id: "asc" } }),
        attendances: await prisma.attendance.findMany({ orderBy: { id: "asc" } }),
        grades: await prisma.grade.findMany({ orderBy: { id: "asc" } }),
        materials: await prisma.material.findMany({ orderBy: { id: "asc" } }),
        news: await prisma.news.findMany({ orderBy: { id: "asc" } }),
        announcements: await prisma.announcement.findMany({ orderBy: { id: "asc" } }),
        admissionRequests: await prisma.admissionRequest.findMany({ orderBy: { id: "asc" } }),
        contactMessages: await prisma.contactMessage.findMany({ orderBy: { id: "asc" } }),
        systemLogs: await prisma.systemLog.findMany({ orderBy: { id: "asc" } }),
    };
    const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const filePath = path.join(backupDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf8");
    const stat = await fs.stat(filePath);
    return {
        fileName,
        filePath,
        createdAt: toSerializableDate(stat.mtime),
        sizeBytes: stat.size,
        reason,
        triggeredById: triggeredById ?? null,
    };
}
async function getLatestBackupFileName() {
    await ensureBackupDir();
    const files = await fs.readdir(backupDir);
    const backups = files.filter((file) => file.startsWith("backup-") && file.endsWith(".json"));
    if (backups.length === 0) {
        return null;
    }
    backups.sort((a, b) => a.localeCompare(b));
    return backups[backups.length - 1] ?? null;
}
function normalizeDateFields(record, fields) {
    for (const field of fields) {
        const value = record[field];
        if (typeof value === "string") {
            record[field] = new Date(value);
        }
    }
    return record;
}
function mapArray(items, fields) {
    return items.map((item) => normalizeDateFields({ ...item }, fields));
}
async function restoreFromPayload(payload) {
    const roles = payload.roles ?? [];
    const users = payload.users ?? [];
    const programs = payload.programs ?? [];
    const classGroups = payload.classGroups ?? [];
    const schedules = payload.schedules ?? [];
    const enrollments = payload.enrollments ?? [];
    const attendances = payload.attendances ?? [];
    const grades = payload.grades ?? [];
    const materials = payload.materials ?? [];
    const news = payload.news ?? [];
    const announcements = payload.announcements ?? [];
    const admissionRequests = payload.admissionRequests ?? [];
    const contactMessages = payload.contactMessages ?? [];
    const systemLogs = payload.systemLogs ?? [];
    await prisma.$transaction(async (tx) => {
        await tx.systemLog.deleteMany();
        await tx.contactMessage.deleteMany();
        await tx.admissionRequest.deleteMany();
        await tx.announcement.deleteMany();
        await tx.news.deleteMany();
        await tx.material.deleteMany();
        await tx.grade.deleteMany();
        await tx.attendance.deleteMany();
        await tx.enrollment.deleteMany();
        await tx.schedule.deleteMany();
        await tx.classGroup.deleteMany();
        await tx.user.deleteMany();
        await tx.program.deleteMany();
        await tx.role.deleteMany();
        if (roles.length) {
            await tx.role.createMany({
                data: roles.map((role) => ({
                    id: Number(role.id),
                    name: role.name,
                })),
            });
        }
        if (programs.length) {
            await tx.program.createMany({
                data: mapArray(programs, ["createdAt", "updatedAt"]).map((program) => ({
                    id: Number(program.id),
                    name: String(program.name),
                    description: program.description ?? null,
                    isActive: Boolean(program.isActive),
                    createdAt: program.createdAt,
                    updatedAt: program.updatedAt,
                })),
            });
        }
        if (users.length) {
            await tx.user.createMany({
                data: mapArray(users, ["createdAt", "updatedAt"]).map((user) => ({
                    id: Number(user.id),
                    email: String(user.email),
                    password: String(user.password),
                    firstName: String(user.firstName),
                    lastName: String(user.lastName),
                    phone: user.phone ?? null,
                    avatarUrl: user.avatarUrl ?? null,
                    isActive: Boolean(user.isActive),
                    roleId: Number(user.roleId),
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                })),
            });
        }
        if (classGroups.length) {
            await tx.classGroup.createMany({
                data: mapArray(classGroups, ["createdAt", "updatedAt", "startDate", "endDate"]).map((group) => ({
                    id: Number(group.id),
                    name: String(group.name),
                    programId: Number(group.programId),
                    teacherId: group.teacherId === null || group.teacherId === undefined ? null : Number(group.teacherId),
                    startDate: group.startDate,
                    endDate: group.endDate,
                    isActive: Boolean(group.isActive),
                    createdAt: group.createdAt,
                    updatedAt: group.updatedAt,
                })),
            });
        }
        if (schedules.length) {
            await tx.schedule.createMany({
                data: schedules.map((schedule) => ({
                    id: Number(schedule.id),
                    classGroupId: Number(schedule.classGroupId),
                    dayOfWeek: Number(schedule.dayOfWeek),
                    startTime: String(schedule.startTime),
                    endTime: String(schedule.endTime),
                    room: schedule.room ?? null,
                })),
            });
        }
        if (enrollments.length) {
            await tx.enrollment.createMany({
                data: mapArray(enrollments, ["enrolledAt"]).map((enrollment) => ({
                    id: Number(enrollment.id),
                    studentId: Number(enrollment.studentId),
                    classGroupId: Number(enrollment.classGroupId),
                    enrolledAt: enrollment.enrolledAt,
                })),
            });
        }
        if (attendances.length) {
            await tx.attendance.createMany({
                data: mapArray(attendances, ["date", "createdAt"]).map((attendance) => ({
                    id: Number(attendance.id),
                    classGroupId: Number(attendance.classGroupId),
                    studentId: Number(attendance.studentId),
                    date: attendance.date,
                    status: attendance.status,
                    takenById: Number(attendance.takenById),
                    createdAt: attendance.createdAt,
                })),
            });
        }
        if (grades.length) {
            await tx.grade.createMany({
                data: mapArray(grades, ["createdAt"]).map((grade) => ({
                    id: Number(grade.id),
                    classGroupId: Number(grade.classGroupId),
                    studentId: Number(grade.studentId),
                    givenById: Number(grade.givenById),
                    title: String(grade.title),
                    score: Number(grade.score),
                    maxScore: Number(grade.maxScore),
                    comment: grade.comment ?? null,
                    createdAt: grade.createdAt,
                })),
            });
        }
        if (materials.length) {
            await tx.material.createMany({
                data: mapArray(materials, ["createdAt"]).map((material) => ({
                    id: Number(material.id),
                    classGroupId: Number(material.classGroupId),
                    uploadedById: Number(material.uploadedById),
                    title: String(material.title),
                    fileUrl: material.fileUrl ?? null,
                    videoUrl: material.videoUrl ?? null,
                    fileType: material.fileType ?? null,
                    createdAt: material.createdAt,
                })),
            });
        }
        if (news.length) {
            await tx.news.createMany({
                data: mapArray(news, ["createdAt", "updatedAt"]).map((item) => ({
                    id: Number(item.id),
                    title: String(item.title),
                    content: String(item.content),
                    imageUrl: item.imageUrl ?? null,
                    isPublished: Boolean(item.isPublished),
                    authorId: Number(item.authorId),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),
            });
        }
        if (announcements.length) {
            await tx.announcement.createMany({
                data: mapArray(announcements, ["createdAt", "updatedAt"]).map((item) => ({
                    id: Number(item.id),
                    title: String(item.title),
                    content: String(item.content),
                    isPublished: Boolean(item.isPublished),
                    authorId: Number(item.authorId),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),
            });
        }
        if (admissionRequests.length) {
            await tx.admissionRequest.createMany({
                data: mapArray(admissionRequests, ["createdAt", "updatedAt"]).map((item) => ({
                    id: Number(item.id),
                    firstName: String(item.firstName),
                    lastName: String(item.lastName),
                    email: String(item.email),
                    phone: String(item.phone),
                    programId: Number(item.programId),
                    message: item.message ?? null,
                    status: item.status,
                    reviewedById: item.reviewedById === null || item.reviewedById === undefined ? null : Number(item.reviewedById),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),
            });
        }
        if (contactMessages.length) {
            await tx.contactMessage.createMany({
                data: mapArray(contactMessages, ["createdAt"]).map((item) => ({
                    id: Number(item.id),
                    name: String(item.name),
                    email: String(item.email),
                    subject: item.subject ?? null,
                    message: String(item.message),
                    isReplied: Boolean(item.isReplied),
                    repliedById: item.repliedById === null || item.repliedById === undefined ? null : Number(item.repliedById),
                    createdAt: item.createdAt,
                })),
            });
        }
        if (systemLogs.length) {
            await tx.systemLog.createMany({
                data: mapArray(systemLogs, ["createdAt"]).map((item) => ({
                    id: Number(item.id),
                    userId: item.userId === null || item.userId === undefined ? null : Number(item.userId),
                    action: String(item.action),
                    details: item.details ?? null,
                    ipAddress: item.ipAddress ?? null,
                    createdAt: item.createdAt,
                })),
            });
        }
    });
}
async function restoreLatestBackupFile() {
    const latest = await getLatestBackupFileName();
    if (!latest) {
        throw new Error("No backup file found.");
    }
    const { payload } = await loadBackupPayload(latest);
    await restoreFromPayload(payload);
    return {
        fileName: latest,
        filePath: path.join(backupDir, latest),
    };
}
async function restoreFromBackupFile(fileName) {
    const { filePath, payload } = await loadBackupPayload(fileName);
    await restoreFromPayload(payload);
    return { fileName, filePath };
}
async function listBackupFiles() {
    await ensureBackupDir();
    const files = await fs.readdir(backupDir);
    const manifests = await Promise.all(files
        .filter((file) => file.startsWith("backup-") && file.endsWith(".json"))
        .sort((a, b) => b.localeCompare(a))
        .map(async (fileName) => {
        const filePath = path.join(backupDir, fileName);
        const stat = await fs.stat(filePath);
        const payload = await readJsonFile(filePath);
        const meta = payload.meta ?? {};
        return {
            fileName,
            filePath,
            createdAt: stat.mtime.toISOString(),
            sizeBytes: stat.size,
            reason: meta.reason ?? "manual",
            triggeredById: meta.triggeredById ?? null,
        };
    }));
    return manifests;
}
async function runScheduledBackup() {
    try {
        await writeBackupSnapshot("scheduled");
    }
    catch (error) {
        console.error("Scheduled backup failed:", error);
    }
}
export const backupService = {
    async createBackup(triggeredById, reason = "manual") {
        return writeBackupSnapshot(reason, triggeredById);
    },
    async listBackups() {
        return listBackupFiles();
    },
    async restoreLatestBackup() {
        return restoreLatestBackupFile();
    },
    async restoreBackup(fileName) {
        return restoreFromBackupFile(fileName);
    },
    startBackupScheduler() {
        if (schedulerStarted) {
            return;
        }
        schedulerStarted = true;
        void runScheduledBackup();
        setInterval(() => {
            void runScheduledBackup();
        }, 24 * 60 * 60 * 1000);
    },
};
