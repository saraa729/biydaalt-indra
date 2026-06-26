import { dashboardService } from "../services/dashboard.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(400).json({ message });
}

export const dashboardController = {
  async me(req: any, res: any) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required." });
      }

      const dashboard = await dashboardService.getDashboard(user);
      return res.json(dashboard);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
