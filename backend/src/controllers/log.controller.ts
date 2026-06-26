import { logService } from "../services/log.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(400).json({ message });
}

export const logController = {
  async list(req: any, res: any) {
    try {
      const limitValue = req.query.limit !== undefined ? Number(req.query.limit) : 100;
      const limit = Number.isFinite(limitValue) && limitValue > 0 ? Math.min(limitValue, 500) : 100;
      const logs = await logService.listSystemLogs(limit);
      return res.json(logs);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
