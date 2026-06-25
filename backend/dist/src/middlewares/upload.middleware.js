import fs from 'node:fs';
import path from 'node:path';
export const uploadDir = path.resolve(process.cwd(), 'uploads');
export function ensureUploadDir(_req, _res, next) {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    next();
}
export function getUploadFilePath(originalName) {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(uploadDir, `${Date.now()}-${safeName}`);
}
