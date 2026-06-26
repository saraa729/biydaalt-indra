import { authService } from "../services/auth.service.js";
import { logService } from "../services/log.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status =
    message === "Invalid email or password."
      ? 401
      : message === "User account is inactive."
        ? 403
        : message === "A user with this email already exists."
          ? 409
          : message === "JWT_SECRET is not configured."
            ? 500
            : 400;

  return res.status(status).json({ success: false, message });
}

export const authController = {
  async register(req: any, res: any) {
    try {
      const result = await authService.register(req.body);
      await logService.createSystemLog({
        userId: result.user.id,
        action: "AUTH_REGISTER",
        details: JSON.stringify({ email: result.user.email }),
        ipAddress: req.ip ?? null,
      });
      return res.status(201).json({ success: true, ...result });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async login(req: any, res: any) {
    try {
      const result = await authService.login(req.body);
      await logService.createSystemLog({
        userId: result.user.id,
        action: "AUTH_LOGIN",
        details: JSON.stringify({ email: result.user.email }),
        ipAddress: req.ip ?? null,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async me(req: any, res: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const user = await authService.me(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
