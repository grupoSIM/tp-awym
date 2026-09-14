import { Router } from 'express';
import { especialidadesController } from '../controllers/especialidades.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const especialidadesRouter = Router();

especialidadesRouter.use(authenticate);

especialidadesRouter.get(
  '/',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL, Rol.PACIENTE),
  especialidadesController.getEspecialidades.bind(especialidadesController)
);

especialidadesRouter.get(
  '/:id',
  requireRole(Rol.ADMIN, Rol.RECEPCIONISTA, Rol.PROFESIONAL, Rol.PACIENTE),
  especialidadesController.getEspecialidadById.bind(especialidadesController)
);

especialidadesRouter.post(
  '/',
  requireRole(Rol.ADMIN),
  especialidadesController.createEspecialidad.bind(especialidadesController)
);

especialidadesRouter.put(
  '/:id',
  requireRole(Rol.ADMIN),
  especialidadesController.updateEspecialidad.bind(especialidadesController)
);

especialidadesRouter.patch(
  '/:id/estado',
  requireRole(Rol.ADMIN),
  especialidadesController.toggleEstado.bind(especialidadesController)
);
