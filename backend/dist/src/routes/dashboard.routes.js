import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
export const dashboardRoutes = Router();
dashboardRoutes.get("/me", authMiddleware, dashboardController.me);
export default dashboardRoutes;
