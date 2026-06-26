import express from "express";
import * as authController from "../controllers/auth.controller.js";

export const authRoutes = express.Router();

authRoutes.post("/login", authController.login);
authRoutes.get("/verify", authController.verifyToken);
