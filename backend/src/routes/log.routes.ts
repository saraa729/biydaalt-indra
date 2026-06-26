import { Router } from "express";
import { logController } from "../controllers/log.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants/roles.js";

export const logRoutes = Router();

logRoutes.get("/", authMiddleware, authorize(...ADMIN_ROLES), logController.list);

export default logRoutes;
