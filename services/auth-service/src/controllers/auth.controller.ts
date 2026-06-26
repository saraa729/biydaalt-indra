import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({ success: false, message });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];
    const user = await authService.verifyToken(token);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Token verification failed";
    res.status(401).json({ success: false, message });
  }
};
