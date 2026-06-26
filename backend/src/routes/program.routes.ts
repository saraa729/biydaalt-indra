import { Router } from 'express';
import { programController } from '../controllers/program.controller.js';
import { authMiddleware, authorize } from '../middlewares/auth.middleware.js';
import { ACADEMIC_ROLES } from '../constants/roles.js';

export const programRoutes = Router();

programRoutes.get('/', programController.list);
programRoutes.get('/:id', programController.getById);
programRoutes.post('/', authMiddleware, authorize(...ACADEMIC_ROLES), programController.create);
programRoutes.put('/:id', authMiddleware, authorize(...ACADEMIC_ROLES), programController.update);
programRoutes.delete('/:id', authMiddleware, authorize(...ACADEMIC_ROLES), programController.remove);
