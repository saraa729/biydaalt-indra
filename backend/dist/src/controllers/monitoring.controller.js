import { monitoringService } from "../services/monitoring.service.js";
function handleError(res, error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(400).json({ message });
}
export const monitoringController = {
    async overview(_req, res) {
        try {
            const overview = await monitoringService.getOverview();
            return res.json(overview);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async services(_req, res) {
        try {
            const services = await monitoringService.getServicesHealth();
            return res.json({
                generatedAt: new Date().toISOString(),
                services,
            });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
