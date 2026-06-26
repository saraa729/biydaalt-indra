import { Router } from 'express';
import { materialController } from '../controllers/material.controller.js';
export const materialRoutes = Router();
materialRoutes.get('/', materialController.list);
materialRoutes.get('/:id', materialController.getById);
materialRoutes.post('/', materialController.create);
materialRoutes.put('/:id', materialController.update);
materialRoutes.delete('/:id', materialController.remove);
