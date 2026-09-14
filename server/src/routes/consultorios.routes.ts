import { Router } from 'express';
import { consultoriosController } from '../controllers/consultorios.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const consultoriosRouter = Router();

consultoriosRouter.use(authenticate);

consultoriosRouter.get(
  '/',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  consultoriosController.getConsultorios.bind(consultoriosController)
);

consultoriosRouter.get(
  '/:id',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  consultoriosController.getConsultorioById.bind(consultoriosController)
);

consultoriosRouter.post(
  '/',
  requireRole(Rol.ADMIN),
  consultoriosController.createConsultorio.bind(consultoriosController)
);

consultoriosRouter.put(
  '/:id',
  requireRole(Rol.ADMIN),
  consultoriosController.updateConsultorio.bind(consultoriosController)
);

consultoriosRouter.patch(
  '/:id/estado',
  requireRole(Rol.ADMIN),
  consultoriosController.toggleEstado.bind(consultoriosController)
);