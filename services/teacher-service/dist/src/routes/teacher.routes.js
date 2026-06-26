import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller.js';
export const teacherRoutes = Router();
teacherRoutes.get('/', teacherController.list);
teacherRoutes.get('/:id', teacherController.getById);
teacherRoutes.post('/', teacherController.create);
teacherRoutes.put('/:id', teacherController.update);
teacherRoutes.delete('/:id', teacherController.remove);
