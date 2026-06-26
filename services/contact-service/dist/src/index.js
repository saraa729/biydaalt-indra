import 'dotenv/config';
import express from "express";
import prisma from "./config/db.js";
import contactRoutes from "./contact/contact.routes.js";
const app = express();
const port = Number(process.env.PORT ?? 3005);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Contact Service is running." });
});
app.use("/api/contacts", contactRoutes);
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((error, _req, res, _next) => {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
});
const server = app.listen(port, () => {
    console.log(`Contact Service listening on port ${port}`);
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
