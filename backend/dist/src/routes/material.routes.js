import { Router } from 'express';
import { materialController } from '../controllers/material.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
export const materialRoutes = Router();
materialRoutes.get('/', materialController.list);
materialRoutes.get('/:id', materialController.getById);
materialRoutes.post('/', upload.single('file'), materialController.create);
materialRoutes.put('/:id', upload.single('file'), materialController.update);
materialRoutes.delete('/:id', materialController.remove);
