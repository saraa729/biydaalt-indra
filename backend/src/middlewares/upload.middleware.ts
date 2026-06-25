import fs from 'node:fs';
import path from 'node:path';

export const uploadDir = path.resolve(process.cwd(), 'uploads');

export function ensureUploadDir(_req: any, _res: any, next: any) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  next();
}

export function getUploadFilePath(originalName: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(uploadDir, `${Date.now()}-${safeName}`);
}
