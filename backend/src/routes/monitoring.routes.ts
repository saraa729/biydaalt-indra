import { Router } from "express";
import { ADMIN_ROLES, MANAGEMENT_ROLES } from "../constants/roles.js";
import { monitoringController } from "../controllers/monitoring.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

export const monitoringRoutes = Router();

monitoringRoutes.get("/overview", authMiddleware, authorize(...MANAGEMENT_ROLES), monitoringController.overview);
monitoringRoutes.get("/services", authMiddleware, authorize(...ADMIN_ROLES), monitoringController.services);

export default monitoringRoutes;
