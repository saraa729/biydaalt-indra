import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
export const studentRoutes = Router();
studentRoutes.get('/', studentController.list);
studentRoutes.get('/:id', studentController.getById);
studentRoutes.post('/', studentController.create);
studentRoutes.put('/:id', studentController.update);
studentRoutes.delete('/:id', studentController.remove);
