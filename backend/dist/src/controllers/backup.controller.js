import { backupService } from "../services/backup.service.js";
import { logService } from "../services/log.service.js";
function handleError(res, error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(400).json({ message });
}
export const backupController = {
    async list(_req, res) {
        try {
            const backups = await backupService.listBackups();
            return res.json(backups);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const backup = await backupService.createBackup(req.user?.id ?? null, "manual");
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "BACKUP_CREATED",
                details: JSON.stringify({ fileName: backup.fileName }),
                ipAddress: req.ip ?? null,
            });
            return res.status(201).json(backup);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async restoreLatest(req, res) {
        try {
            const result = await backupService.restoreLatestBackup();
            await backupService.createBackup(req.user?.id ?? null, "restore");
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "BACKUP_RESTORED",
                details: JSON.stringify({ fileName: result.fileName }),
                ipAddress: req.ip ?? null,
            });
            return res.json({ restored: true, ...result });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async restore(req, res) {
        try {
            const fileName = String(req.body.fileName ?? "").trim();
            if (!fileName) {
                return res.status(400).json({ message: "fileName is required" });
            }
            const result = await backupService.restoreBackup(fileName);
            await backupService.createBackup(req.user?.id ?? null, "restore");
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "BACKUP_RESTORED",
                details: JSON.stringify({ fileName: result.fileName }),
                ipAddress: req.ip ?? null,
            });
            return res.json({ restored: true, ...result });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
