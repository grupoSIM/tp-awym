import { Router } from 'express';
import { profesionalesController } from '../controllers/profesionales.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const profesionalesRouter = Router();

profesionalesRouter.use(authenticate);

profesionalesRouter.get(
  '/',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL, Rol.PACIENTE),
  profesionalesController.getProfesionales.bind(profesionalesController)
);

profesionalesRouter.get(
  '/:id',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  profesionalesController.getProfesionalById.bind(profesionalesController)
);

profesionalesRouter.post(
  '/',
  requireRole(Rol.ADMIN),
  profesionalesController.createProfesional.bind(profesionalesController)
);

profesionalesRouter.put(
  '/:id',
  requireRole(Rol.ADMIN),
  profesionalesController.updateProfesional.bind(profesionalesController)
);

profesionalesRouter.patch(
  '/:id/estado',
  requireRole(Rol.ADMIN),
  profesionalesController.toggleEstado.bind(profesionalesController)
);
