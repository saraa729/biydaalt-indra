import { Router } from "express";
import { newsController } from "../controllers/news.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { MANAGEMENT_ROLES } from "../constants/roles.js";

export const newsRoutes = Router();

newsRoutes.get("/", newsController.list);
newsRoutes.get("/:id", newsController.getById);
newsRoutes.post("/", authMiddleware, authorize(...MANAGEMENT_ROLES), newsController.create);
newsRoutes.put("/:id", authMiddleware, authorize(...MANAGEMENT_ROLES), newsController.update);
newsRoutes.delete("/:id", authMiddleware, authorize(...MANAGEMENT_ROLES), newsController.remove);

export default newsRoutes;
