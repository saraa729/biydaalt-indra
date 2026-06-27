import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import prisma from "./config/db.js";
import admissionRoutes from "./routes/admission.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import backupRoutes from "./routes/backup.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./contact/contact.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import gradeRoutes from "./routes/grade.routes.js";
import logRoutes from "./routes/log.routes.js";
import monitoringRoutes from "./routes/monitoring.routes.js";
import newsRoutes from "./routes/news.routes.js";
import { ensureUploadDir, uploadDir } from "./middlewares/upload.middleware.js";
import { materialRoutes } from "./routes/material.routes.js";
import { programRoutes } from "./routes/program.routes.js";
import { studentRoutes } from "./routes/student.routes.js";
import { teacherRoutes } from "./routes/teacher.routes.js";
import { backupService } from "./services/backup.service.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const frontendDistDir =
  process.env.FRONTEND_DIST_DIR ?? path.resolve(process.cwd(), "../Front/dist");
const frontendIndexPath = path.join(frontendDistDir, "index.html");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(ensureUploadDir);
app.use("/uploads", express.static(uploadDir));
app.use(express.static(frontendDistDir));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is running." });
});

app.get("/", (_req: Request, res: Response) => {
  if (fs.existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }

  res.status(200).send("Frontend build not found.");
});

app.use("/contacts", contactRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/admissions", admissionRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/news", newsRoutes);
app.use("/api/news", newsRoutes);
app.use("/announcements", announcementRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/auth", authRoutes);
app.use("/teachers", teacherRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/students", studentRoutes);
app.use("/api/students", studentRoutes);
app.use("/materials", materialRoutes);
app.use("/api/materials", materialRoutes);
app.use("/programs", programRoutes);
app.use("/api/programs", programRoutes);
app.use("/grades", gradeRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/logs", logRoutes);
app.use("/api/logs", logRoutes);
app.use("/monitoring", monitoringRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/backups", backupRoutes);
app.use("/api/backups", backupRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  const message = error instanceof Error ? error.message : "Internal server error";
  res.status(500).json({ message });
});

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  backupService.startBackupScheduler();
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Prisma disconnected");
      process.exit(0);
    } catch (error) {
      console.error("Shutdown error:", error);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
