import { Router } from 'express';
import { agendasController } from '../controllers/agendas.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const agendasRouter = Router();

agendasRouter.use(authenticate);

agendasRouter.get(
  '/',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  agendasController.getAgendas.bind(agendasController)
);

agendasRouter.get(
  '/:id',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  agendasController.getAgendaById.bind(agendasController)
);

agendasRouter.post(
  '/',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  agendasController.createAgenda.bind(agendasController)
);

agendasRouter.put(
  '/:id',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  agendasController.updateAgenda.bind(agendasController)
);

agendasRouter.patch(
  '/:id/estado',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL),
  agendasController.toggleEstado.bind(agendasController)
);