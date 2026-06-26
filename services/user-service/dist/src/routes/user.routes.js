import express from "express";
import * as userController from "../controllers/user.controller.js";
export const userRoutes = express.Router();
userRoutes.get("/", userController.getAllUsers);
userRoutes.get("/roles", userController.getAllRoles);
userRoutes.get("/:id", userController.getUserById);
userRoutes.post("/", userController.createUser);
userRoutes.put("/:id", userController.updateUser);
userRoutes.delete("/:id", userController.deleteUser);
