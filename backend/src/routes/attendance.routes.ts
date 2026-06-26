import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { MANAGEMENT_ROLES, TEACHING_ROLES } from "../constants/roles.js";

export const attendanceRoutes = Router();

attendanceRoutes.get("/me", authMiddleware, authorize("STUDENT"), attendanceController.myAttendance);
attendanceRoutes.get("/", authMiddleware, authorize(...TEACHING_ROLES), attendanceController.list);
attendanceRoutes.get("/:id", authMiddleware, authorize(...TEACHING_ROLES), attendanceController.getById);
attendanceRoutes.post("/", authMiddleware, authorize(...TEACHING_ROLES), attendanceController.create);
attendanceRoutes.put("/:id", authMiddleware, authorize(...TEACHING_ROLES), attendanceController.update);
attendanceRoutes.delete("/:id", authMiddleware, authorize(...MANAGEMENT_ROLES), attendanceController.remove);

export default attendanceRoutes;
