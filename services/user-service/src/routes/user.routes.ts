import express from "express";
import * as roleController from "../controllers/role.controller.js";
import * as userController from "../controllers/user.controller.js";

export const userRoutes = express.Router();

userRoutes.get("/", userController.getAllUsers);
userRoutes.get("/roles", roleController.getAllRoles);
userRoutes.get("/roles/:id", roleController.getRoleById);
userRoutes.post("/roles", roleController.createRole);
userRoutes.put("/roles/:id", roleController.updateRole);
userRoutes.delete("/roles/:id", roleController.deleteRole);
userRoutes.get("/:id", userController.getUserById);
userRoutes.post("/", userController.createUser);
userRoutes.put("/:id", userController.updateUser);
userRoutes.delete("/:id", userController.deleteUser);
