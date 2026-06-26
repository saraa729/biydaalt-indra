import { Router } from "express";
import { announcementController } from "../controllers/announcement.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { CONTENT_ROLES } from "../constants/roles.js";

export const announcementRoutes = Router();

announcementRoutes.get("/", announcementController.list);
announcementRoutes.get("/:id", announcementController.getById);
announcementRoutes.post("/", authMiddleware, authorize(...CONTENT_ROLES), announcementController.create);
announcementRoutes.put("/:id", authMiddleware, authorize(...CONTENT_ROLES), announcementController.update);
announcementRoutes.delete("/:id", authMiddleware, authorize(...CONTENT_ROLES), announcementController.remove);

export default announcementRoutes;
