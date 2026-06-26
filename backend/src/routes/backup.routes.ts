import { Router } from "express";
import { backupController } from "../controllers/backup.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { BACKUP_ROLES } from "../constants/roles.js";

export const backupRoutes = Router();

backupRoutes.get("/", authMiddleware, authorize(...BACKUP_ROLES), backupController.list);
backupRoutes.post("/", authMiddleware, authorize(...BACKUP_ROLES), backupController.create);
backupRoutes.post("/restore", authMiddleware, authorize(...BACKUP_ROLES), backupController.restore);
backupRoutes.post("/restore-latest", authMiddleware, authorize(...BACKUP_ROLES), backupController.restoreLatest);

export default backupRoutes;
