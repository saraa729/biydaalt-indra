import { Router } from 'express';
import { materialController } from '../controllers/material.controller.js';
import { authMiddleware, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { MANAGEMENT_ROLES, TEACHING_ROLES } from '../constants/roles.js';

export const materialRoutes = Router();

materialRoutes.get('/', materialController.list);
materialRoutes.get('/:id', materialController.getById);
materialRoutes.post('/', authMiddleware, authorize(...TEACHING_ROLES), upload.single('file'), materialController.create);
materialRoutes.put('/:id', authMiddleware, authorize(...TEACHING_ROLES), upload.single('file'), materialController.update);
materialRoutes.delete('/:id', authMiddleware, authorize(...MANAGEMENT_ROLES), materialController.remove);
