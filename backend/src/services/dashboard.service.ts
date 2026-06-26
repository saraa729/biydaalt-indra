import prisma from "../config/db.js";
import type { DashboardPayload, DashboardRole } from "../interfaces/Dashboard.js";

type UserContext = {
  id: number;
  role?: {
    name?: DashboardRole;
  } | null;
};

function recentLimit(limit = 5) {
  return { take: limit, orderBy: { createdAt: "desc" as const } };
}

async function getManagementDashboard(role: Exclude<DashboardRole, "ACADEMIC_OFFICE" | "MODERATOR" | "TEACHER" | "STUDENT">): Promise<DashboardPayload> {
  const [
    users,
    programs,
    classes,
    admissions,
    news,
    announcements,
    contacts,
    materials,
    attendances,
    grades,
    logs,
    recentAdmissions,
    recentNews,
    recentAnnouncements,
    recentContacts,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.program.count(),
    prisma.classGroup.count(),
    prisma.admissionRequest.count(),
    prisma.news.count(),
    prisma.announcement.count(),
    prisma.contactMessage.count(),
    prisma.material.count(),
    prisma.attendance.count(),
    prisma.grade.count(),
    prisma.systemLog.count(),
    prisma.admissionRequest.findMany({
      ...recentLimit(),
      select: { id: true, firstName: true, lastName: true, status: true, createdAt: true },
    }),
    prisma.news.findMany({
      ...recentLimit(),
      select: { id: true, title: true, isPublished: true, createdAt: true },
    }),
    prisma.announcement.findMany({
      ...recentLimit(),
      select: { id: true, title: true, isPublished: true, createdAt: true },
    }),
    prisma.contactMessage.findMany({
      ...recentLimit(),
      select: { id: true, name: true, email: true, isReplied: true, createdAt: true },
    }),
    prisma.systemLog.findMany({
      ...recentLimit(),
      select: { id: true, action: true, details: true, createdAt: true },
    }),
  ]);

  return {
    role,
    generatedAt: new Date().toISOString(),
    summary: {
      users,
      programs,
      classes,
      admissions,
      news,
      announcements,
      contacts,
      materials,
      attendances,
      grades,
      logs,
    },
    recent: {
      admissions: recentAdmissions,
      news: recentNews,
      announcements: recentAnnouncements,
      contacts: recentContacts,
      logs: recentLogs,
    },
  };
}

async function getAcademicDashboard(role: "ACADEMIC_OFFICE"): Promise<DashboardPayload> {
  const [programs, classes, admissions, teachers, students, recentAdmissions] = await Promise.all([
    prisma.program.count(),
    prisma.classGroup.count(),
    prisma.admissionRequest.count(),
    prisma.user.count({ where: { role: { name: "TEACHER" } } }),
    prisma.user.count({ where: { role: { name: "STUDENT" } } }),
    prisma.admissionRequest.findMany({
      ...recentLimit(),
      select: { id: true, firstName: true, lastName: true, status: true, programId: true, createdAt: true },
    }),
  ]);

  return {
    role,
    generatedAt: new Date().toISOString(),
    summary: {
      programs,
      classes,
      admissions,
      teachers,
      students,
    },
    recent: {
      admissions: recentAdmissions,
    },
  };
}

async function getContentDashboard(role: "MODERATOR"): Promise<DashboardPayload> {
  const [news, announcements, contacts, recentNews, recentAnnouncements, recentContacts] = await Promise.all([
    prisma.news.count(),
    prisma.announcement.count(),
    prisma.contactMessage.count(),
    prisma.news.findMany({
      ...recentLimit(),
      select: { id: true, title: true, isPublished: true, createdAt: true },
    }),
    prisma.announcement.findMany({
      ...recentLimit(),
      select: { id: true, title: true, isPublished: true, createdAt: true },
    }),
    prisma.contactMessage.findMany({
      ...recentLimit(),
      select: { id: true, name: true, subject: true, isReplied: true, createdAt: true },
    }),
  ]);

  return {
    role,
    generatedAt: new Date().toISOString(),
    summary: {
      news,
      announcements,
      contacts,
    },
    recent: {
      news: recentNews,
      announcements: recentAnnouncements,
      contacts: recentContacts,
    },
  };
}

async function getTeachingDashboard(userId: number, role: "TEACHER"): Promise<DashboardPayload> {
  const [classes, materials, attendances, grades, recentGrades, recentAttendances] = await Promise.all([
    prisma.classGroup.count({ where: { teacherId: userId } }),
    prisma.material.count({ where: { uploadedById: userId } }),
    prisma.attendance.count({ where: { takenById: userId } }),
    prisma.grade.count({ where: { givenById: userId } }),
    prisma.grade.findMany({
      ...recentLimit(),
      where: { givenById: userId },
      select: { id: true, title: true, score: true, maxScore: true, createdAt: true },
    }),
    prisma.attendance.findMany({
      ...recentLimit(),
      where: { takenById: userId },
      select: { id: true, status: true, date: true, createdAt: true },
    }),
  ]);

  return {
    role,
    generatedAt: new Date().toISOString(),
    summary: {
      classes,
      materials,
      attendances,
      grades,
    },
    recent: {
      grades: recentGrades,
      attendances: recentAttendances,
    },
  };
}

async function getStudentDashboard(userId: number, role: "STUDENT"): Promise<DashboardPayload> {
  const [user, attendances, grades, materials, recentGrades, recentAttendances] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: { select: { name: true } },
      },
    }),
    prisma.attendance.count({ where: { studentId: userId } }),
    prisma.grade.count({ where: { studentId: userId } }),
    prisma.material.count(),
    prisma.grade.findMany({
      ...recentLimit(),
      where: { studentId: userId },
      select: { id: true, title: true, score: true, maxScore: true, createdAt: true },
    }),
    prisma.attendance.findMany({
      ...recentLimit(),
      where: { studentId: userId },
      select: { id: true, status: true, date: true, createdAt: true },
    }),
  ]);

  return {
    role,
    generatedAt: new Date().toISOString(),
    summary: {
      attendances,
      grades,
      materials,
    },
    recent: {
      grades: recentGrades,
      attendances: recentAttendances,
    },
    focus: {
      profile: user,
    },
  };
}

export const dashboardService = {
  async getDashboard(user: UserContext): Promise<DashboardPayload> {
    switch (user.role?.name) {
      case "SUPER_ADMIN":
      case "OWNER":
      case "DIRECTOR":
        return getManagementDashboard(user.role?.name ?? "SUPER_ADMIN");
      case "ACADEMIC_OFFICE":
        return getAcademicDashboard("ACADEMIC_OFFICE");
      case "MODERATOR":
        return getContentDashboard("MODERATOR");
      case "TEACHER":
        return getTeachingDashboard(user.id, "TEACHER");
      case "STUDENT":
        return getStudentDashboard(user.id, "STUDENT");
      default:
        return {
          role: "STUDENT",
          generatedAt: new Date().toISOString(),
          summary: {},
          recent: {},
        };
    }
  },
};
