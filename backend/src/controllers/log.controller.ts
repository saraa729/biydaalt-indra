import { logService } from "../services/log.service.js";
import type { ListSystemLogsFilters } from "../services/log.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(400).json({ message });
}

function parseNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const logController = {
  async list(req: any, res: any) {
    try {
      const limitValue = req.query.limit !== undefined ? Number(req.query.limit) : 100;
      const filters: ListSystemLogsFilters = {
        limit: Number.isFinite(limitValue) && limitValue > 0 ? Math.min(limitValue, 500) : 100,
        action: typeof req.query.action === "string" ? req.query.action : undefined,
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        userId: parseNumber(req.query.userId),
        ipAddress: typeof req.query.ipAddress === "string" ? req.query.ipAddress : undefined,
        from: parseDate(req.query.from),
        to: parseDate(req.query.to),
      };

      const logs = await logService.listSystemLogs(filters);
      return res.json(logs);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async stats(req: any, res: any) {
    try {
      const filters = {
        action: typeof req.query.action === "string" ? req.query.action : undefined,
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        userId: parseNumber(req.query.userId),
        ipAddress: typeof req.query.ipAddress === "string" ? req.query.ipAddress : undefined,
        from: parseDate(req.query.from),
        to: parseDate(req.query.to),
      };

      const stats = await logService.getSystemLogStats(filters);
      return res.json(stats);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
