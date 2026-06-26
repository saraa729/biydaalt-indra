import { monitoringService } from "../services/monitoring.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(400).json({ message });
}

export const monitoringController = {
  async overview(_req: any, res: any) {
    try {
      const overview = await monitoringService.getOverview();
      return res.json(overview);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async services(_req: any, res: any) {
    try {
      const services = await monitoringService.getServicesHealth();
      return res.json({
        generatedAt: new Date().toISOString(),
        services,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
