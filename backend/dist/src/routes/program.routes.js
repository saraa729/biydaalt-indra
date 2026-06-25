import { Router } from 'express';
import { programController } from '../controllers/program.controller.js';
export const programRoutes = Router();
programRoutes.get('/', programController.list);
programRoutes.get('/:id', programController.getById);
programRoutes.post('/', programController.create);
programRoutes.put('/:id', programController.update);
programRoutes.delete('/:id', programController.remove);
