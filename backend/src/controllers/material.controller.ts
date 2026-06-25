import { materialService } from '../services/material.service.js';

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return res.status(400).json({ message });
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid id');
  }
  return id;
}

export const materialController = {
  async list(_req: any, res: any) {
    try {
      const materials = await materialService.listMaterials();
      return res.json(materials);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const material = await materialService.getMaterialById(id);
      return res.json(material);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: any, res: any) {
    try {
      const material = await materialService.createMaterial(req.body);
      return res.status(201).json(material);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const material = await materialService.updateMaterial(id, req.body);
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }
      return res.json(material);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const deleted = await materialService.deleteMaterial(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Material not found' });
      }
      return res.json({ deleted });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
