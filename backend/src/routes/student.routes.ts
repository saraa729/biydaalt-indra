import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authMiddleware, authorize } from '../middlewares/auth.middleware.js';
import { ACADEMIC_ROLES } from '../constants/roles.js';

export const studentRoutes = Router();

studentRoutes.get('/', authMiddleware, authorize(...ACADEMIC_ROLES), studentController.list);
studentRoutes.get('/:id', authMiddleware, authorize(...ACADEMIC_ROLES), studentController.getById);
studentRoutes.post('/', authMiddleware, authorize(...ACADEMIC_ROLES), studentController.create);
studentRoutes.put('/:id', authMiddleware, authorize(...ACADEMIC_ROLES), studentController.update);
studentRoutes.delete('/:id', authMiddleware, authorize(...ACADEMIC_ROLES), studentController.remove);
