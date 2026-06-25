import 'dotenv/config';
import express from "express";
import fs from "node:fs";
import path from "node:path";
import prisma from "./config/db.js";
import contactRoutes from "./contact/contact.routes.js";
import { ensureUploadDir, uploadDir } from "./middlewares/upload.middleware.js";
import { materialRoutes } from "./routes/material.routes.js";
import { programRoutes } from "./routes/program.routes.js";
import { studentRoutes } from "./routes/student.routes.js";
import { teacherRoutes } from "./routes/teacher.routes.js";
const app = express();
const port = Number(process.env.PORT ?? 3000);
const frontendDistDir = process.env.FRONTEND_DIST_DIR ?? path.resolve(process.cwd(), "../Indra/dist");
const frontendIndexPath = path.join(frontendDistDir, "index.html");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(ensureUploadDir);
app.use("/uploads", express.static(uploadDir));
app.use(express.static(frontendDistDir));
app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Server is running." });
});
app.get("/", (_req, res) => {
    if (fs.existsSync(frontendIndexPath)) {
        return res.sendFile(frontendIndexPath);
    }
    res.status(200).send("Frontend build not found.");
});
app.use("/api/contacts", contactRoutes);
app.use("/teachers", teacherRoutes);
app.use("/students", studentRoutes);
app.use("/materials", materialRoutes);
app.use("/programs", programRoutes);
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((error, _req, res, _next) => {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
});
const server = app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
async function shutdown(signal) {
    console.log(`Received ${signal}, shutting down...`);
    server.close(async () => {
        try {
            await prisma.$disconnect();
            console.log("Prisma disconnected");
            process.exit(0);
        }
        catch (error) {
            console.error("Shutdown error:", error);
            process.exit(1);
        }
    });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
