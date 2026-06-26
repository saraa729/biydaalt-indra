import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
