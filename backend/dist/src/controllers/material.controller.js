import { materialService } from '../services/material.service.js';
function handleError(res, error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ message });
}
function parseNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}
function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid id');
    }
    return id;
}
export const materialController = {
    async list(_req, res) {
        try {
            const materials = await materialService.listMaterials();
            return res.json(materials);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const material = await materialService.getMaterialById(id);
            return res.json(material);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const uploadedFile = req.file;
            const payload = {
                title: req.body.title,
                fileUrl: uploadedFile ? `/uploads/${uploadedFile.filename}` : req.body.fileUrl,
                videoUrl: req.body.videoUrl,
                fileType: req.body.fileType ?? uploadedFile?.mimetype ?? (uploadedFile ? 'application/pdf' : undefined),
                classGroupId: parseNumber(req.body.classGroupId),
                uploadedById: parseNumber(req.body.uploadedById),
            };
            if (uploadedFile && uploadedFile.mimetype !== 'application/pdf') {
                return res.status(400).json({ message: 'Only PDF uploads are allowed.' });
            }
            const material = await materialService.createMaterial(payload);
            return res.status(201).json(material);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const uploadedFile = req.file;
            const payload = {
                title: req.body.title,
                fileUrl: uploadedFile ? `/uploads/${uploadedFile.filename}` : req.body.fileUrl,
                videoUrl: req.body.videoUrl,
                fileType: req.body.fileType ?? uploadedFile?.mimetype ?? (uploadedFile ? 'application/pdf' : undefined),
                classGroupId: req.body.classGroupId !== undefined ? parseNumber(req.body.classGroupId) : undefined,
                uploadedById: req.body.uploadedById !== undefined ? parseNumber(req.body.uploadedById) : undefined,
            };
            if (uploadedFile && uploadedFile.mimetype !== 'application/pdf') {
                return res.status(400).json({ message: 'Only PDF uploads are allowed.' });
            }
            const material = await materialService.updateMaterial(id, payload);
            if (!material) {
                return res.status(404).json({ message: 'Material not found' });
            }
            return res.json(material);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await materialService.deleteMaterial(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Material not found' });
            }
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
