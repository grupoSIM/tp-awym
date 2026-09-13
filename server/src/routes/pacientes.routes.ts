import { Router, Request, Response } from 'express';
import { pacientesController } from '../controllers/pacientes.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const pacientesRouter = Router();

pacientesRouter.use(authenticate);

pacientesRouter.get('/', requireRole(Rol.RECEPCIONISTA, Rol.ADMIN), (req: Request, res: Response) =>
  pacientesController.list(req, res)
);

pacientesRouter.get('/:id', requireRole(Rol.RECEPCIONISTA, Rol.ADMIN, Rol.PACIENTE), (req: Request, res: Response) =>
  pacientesController.getById(req, res)
);

pacientesRouter.post('/', requireRole(Rol.RECEPCIONISTA, Rol.ADMIN), (req: Request, res: Response) =>
  pacientesController.create(req, res)
);

pacientesRouter.put('/:id', requireRole(Rol.RECEPCIONISTA, Rol.ADMIN, Rol.PACIENTE), (req: Request, res: Response) =>
  pacientesController.update(req, res)
);

pacientesRouter.patch('/:id/estado', requireRole(Rol.RECEPCIONISTA, Rol.ADMIN), (req: Request, res: Response) =>
  pacientesController.toggleEstado(req, res)
);
