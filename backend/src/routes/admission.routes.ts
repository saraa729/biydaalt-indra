import { Router } from "express";
import { admissionController } from "../controllers/admission.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { ACADEMIC_ROLES } from "../constants/roles.js";

export const admissionRoutes = Router();

admissionRoutes.get("/", authMiddleware, authorize(...ACADEMIC_ROLES), admissionController.list);
admissionRoutes.get("/:id", authMiddleware, authorize(...ACADEMIC_ROLES), admissionController.getById);
admissionRoutes.post("/", admissionController.create);
admissionRoutes.put("/:id", authMiddleware, authorize(...ACADEMIC_ROLES), admissionController.update);
admissionRoutes.delete("/:id", authMiddleware, authorize(...ACADEMIC_ROLES), admissionController.remove);

export default admissionRoutes;
