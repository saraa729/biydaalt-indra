import fs from "node:fs/promises";
import path from "node:path";
import prisma from "../config/db.js";
import type { BackupManifest } from "../interfaces/Backup.js";

type BackupReason = BackupManifest["reason"];

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
} as const;

async function ensureBackupDir() {
  await fs.mkdir(backupDir, { recursive: true });
}

function assertBackupFileName(fileName: string) {
  const normalized = path.basename(fileName);
  if (normalized !== fileName || !fileName.startsWith("backup-") || !fileName.endsWith(".json")) {
    throw new Error("Invalid backup file name.");
  }
}

function toSerializableDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : value;
}

async function readJsonFile(filePath: string) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content) as Record<string, unknown>;
}

async function loadBackupPayload(fileName: string) {
  assertBackupFileName(fileName);
  await ensureBackupDir();
  const filePath = path.join(backupDir, fileName);
  const payload = await readJsonFile(filePath);
  return { filePath, payload };
}

async function writeBackupSnapshot(reason: BackupReason, triggeredById?: number | null) {
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
    createdAt: toSerializableDate(stat.mtime) as string,
    sizeBytes: stat.size,
    reason,
    triggeredById: triggeredById ?? null,
  } satisfies BackupManifest;
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

function normalizeDateFields(record: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string") {
      record[field] = new Date(value);
    }
  }
  return record;
}

function mapArray<T extends Record<string, unknown>>(items: T[], fields: string[]) {
  return items.map((item) => normalizeDateFields({ ...item }, fields));
}

async function restoreFromPayload(payload: Record<string, unknown>) {
  const roles = (payload.roles as Record<string, unknown>[] | undefined) ?? [];
  const users = (payload.users as Record<string, unknown>[] | undefined) ?? [];
  const programs = (payload.programs as Record<string, unknown>[] | undefined) ?? [];
  const classGroups = (payload.classGroups as Record<string, unknown>[] | undefined) ?? [];
  const schedules = (payload.schedules as Record<string, unknown>[] | undefined) ?? [];
  const enrollments = (payload.enrollments as Record<string, unknown>[] | undefined) ?? [];
  const attendances = (payload.attendances as Record<string, unknown>[] | undefined) ?? [];
  const grades = (payload.grades as Record<string, unknown>[] | undefined) ?? [];
  const materials = (payload.materials as Record<string, unknown>[] | undefined) ?? [];
  const news = (payload.news as Record<string, unknown>[] | undefined) ?? [];
  const announcements = (payload.announcements as Record<string, unknown>[] | undefined) ?? [];
  const admissionRequests = (payload.admissionRequests as Record<string, unknown>[] | undefined) ?? [];
  const contactMessages = (payload.contactMessages as Record<string, unknown>[] | undefined) ?? [];
  const systemLogs = (payload.systemLogs as Record<string, unknown>[] | undefined) ?? [];

  await prisma.$transaction(async (tx: any) => {
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
          name: role.name as any,
        })),
      });
    }

    if (programs.length) {
      await tx.program.createMany({
        data: mapArray(programs, ["createdAt", "updatedAt"]).map((program) => ({
          id: Number(program.id),
          name: String(program.name),
          description: (program.description as string | null | undefined) ?? null,
          isActive: Boolean(program.isActive),
          createdAt: program.createdAt as Date,
          updatedAt: program.updatedAt as Date,
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
          phone: (user.phone as string | null | undefined) ?? null,
          avatarUrl: (user.avatarUrl as string | null | undefined) ?? null,
          isActive: Boolean(user.isActive),
          roleId: Number(user.roleId),
          createdAt: user.createdAt as Date,
          updatedAt: user.updatedAt as Date,
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
          startDate: group.startDate as Date | null,
          endDate: group.endDate as Date | null,
          isActive: Boolean(group.isActive),
          createdAt: group.createdAt as Date,
          updatedAt: group.updatedAt as Date,
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
          room: (schedule.room as string | null | undefined) ?? null,
        })),
      });
    }

    if (enrollments.length) {
      await tx.enrollment.createMany({
        data: mapArray(enrollments, ["enrolledAt"]).map((enrollment) => ({
          id: Number(enrollment.id),
          studentId: Number(enrollment.studentId),
          classGroupId: Number(enrollment.classGroupId),
          enrolledAt: enrollment.enrolledAt as Date,
        })),
      });
    }

    if (attendances.length) {
      await tx.attendance.createMany({
        data: mapArray(attendances, ["date", "createdAt"]).map((attendance) => ({
          id: Number(attendance.id),
          classGroupId: Number(attendance.classGroupId),
          studentId: Number(attendance.studentId),
          date: attendance.date as Date,
          status: attendance.status as any,
          takenById: Number(attendance.takenById),
          createdAt: attendance.createdAt as Date,
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
          comment: (grade.comment as string | null | undefined) ?? null,
          createdAt: grade.createdAt as Date,
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
          fileUrl: (material.fileUrl as string | null | undefined) ?? null,
          videoUrl: (material.videoUrl as string | null | undefined) ?? null,
          fileType: (material.fileType as string | null | undefined) ?? null,
          createdAt: material.createdAt as Date,
        })),
      });
    }

    if (news.length) {
      await tx.news.createMany({
        data: mapArray(news, ["createdAt", "updatedAt"]).map((item) => ({
          id: Number(item.id),
          title: String(item.title),
          content: String(item.content),
          imageUrl: (item.imageUrl as string | null | undefined) ?? null,
          isPublished: Boolean(item.isPublished),
          authorId: Number(item.authorId),
          createdAt: item.createdAt as Date,
          updatedAt: item.updatedAt as Date,
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
          createdAt: item.createdAt as Date,
          updatedAt: item.updatedAt as Date,
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
          message: (item.message as string | null | undefined) ?? null,
          status: item.status as any,
          reviewedById: item.reviewedById === null || item.reviewedById === undefined ? null : Number(item.reviewedById),
          createdAt: item.createdAt as Date,
          updatedAt: item.updatedAt as Date,
        })),
      });
    }

    if (contactMessages.length) {
      await tx.contactMessage.createMany({
        data: mapArray(contactMessages, ["createdAt"]).map((item) => ({
          id: Number(item.id),
          name: String(item.name),
          email: String(item.email),
          subject: (item.subject as string | null | undefined) ?? null,
          message: String(item.message),
          isReplied: Boolean(item.isReplied),
          repliedById: item.repliedById === null || item.repliedById === undefined ? null : Number(item.repliedById),
          createdAt: item.createdAt as Date,
        })),
      });
    }

    if (systemLogs.length) {
      await tx.systemLog.createMany({
        data: mapArray(systemLogs, ["createdAt"]).map((item) => ({
          id: Number(item.id),
          userId: item.userId === null || item.userId === undefined ? null : Number(item.userId),
          action: String(item.action),
          details: (item.details as string | null | undefined) ?? null,
          ipAddress: (item.ipAddress as string | null | undefined) ?? null,
          createdAt: item.createdAt as Date,
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

async function restoreFromBackupFile(fileName: string) {
  const { filePath, payload } = await loadBackupPayload(fileName);
  await restoreFromPayload(payload);
  return { fileName, filePath };
}

async function listBackupFiles(): Promise<BackupManifest[]> {
  await ensureBackupDir();
  const files = await fs.readdir(backupDir);
  const manifests = await Promise.all(
    files
      .filter((file) => file.startsWith("backup-") && file.endsWith(".json"))
      .sort((a, b) => b.localeCompare(a))
      .map(async (fileName) => {
        const filePath = path.join(backupDir, fileName);
        const stat = await fs.stat(filePath);
        const payload = await readJsonFile(filePath);
        const meta = (payload.meta as { reason?: BackupReason; triggeredById?: number | null } | undefined) ?? {};
        return {
          fileName,
          filePath,
          createdAt: stat.mtime.toISOString(),
          sizeBytes: stat.size,
          reason: meta.reason ?? "manual",
          triggeredById: meta.triggeredById ?? null,
        };
      }),
  );

  return manifests;
}

async function runScheduledBackup() {
  try {
    await writeBackupSnapshot("scheduled");
  } catch (error) {
    console.error("Scheduled backup failed:", error);
  }
}

export const backupService = {
  async createBackup(triggeredById?: number | null, reason: BackupReason = "manual") {
    return writeBackupSnapshot(reason, triggeredById);
  },

  async listBackups() {
    return listBackupFiles();
  },

  async restoreLatestBackup() {
    return restoreLatestBackupFile();
  },

  async restoreBackup(fileName: string) {
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
