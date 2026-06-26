import "dotenv/config";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
const app = express();
const port = Number(process.env.PORT ?? 3000);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "API Gateway is running." });
});
app.use("/api/teachers", createProxyMiddleware({
    target: process.env.TEACHER_SERVICE_URL ?? "http://teacher-service:3002",
    changeOrigin: true,
}));
app.use("/api/students", createProxyMiddleware({
    target: process.env.STUDENT_SERVICE_URL ?? "http://student-service:3001",
    changeOrigin: true,
}));
app.use("/api/programs", createProxyMiddleware({
    target: process.env.PROGRAM_SERVICE_URL ?? "http://program-service:3003",
    changeOrigin: true,
}));
app.use("/api/materials", createProxyMiddleware({
    target: process.env.MATERIAL_SERVICE_URL ?? "http://material-service:3004",
    changeOrigin: true,
}));
app.use("/api/contacts", createProxyMiddleware({
    target: process.env.CONTACT_SERVICE_URL ?? "http://contact-service:3005",
    changeOrigin: true,
}));
app.use("/api/auth", createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL ?? "http://auth-service:3006",
    changeOrigin: true,
}));
app.use("/api/admissions", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/news", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/announcements", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/attendance", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/grades", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/dashboard", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/logs", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/backups", createProxyMiddleware({
    target: process.env.BACKEND_SERVICE_URL ?? "http://backend:3008",
    changeOrigin: true,
}));
app.use("/api/users", createProxyMiddleware({
    target: process.env.USER_SERVICE_URL ?? "http://user-service:3007",
    changeOrigin: true,
}));
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((error, _req, res, _next) => {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
});
const server = app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
});
async function shutdown(signal) {
    console.log(`Received ${signal}, shutting down...`);
    server.close(() => {
        process.exit(0);
    });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
