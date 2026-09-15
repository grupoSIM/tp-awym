import { Router } from 'express';
import { portalController } from '../controllers/portal.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const portalRouter = Router();

portalRouter.use(authenticate);
portalRouter.use(requireRole(Rol.PACIENTE));

portalRouter.get('/perfil', (req, res) => portalController.getPerfil(req, res));
portalRouter.put('/perfil', (req, res) => portalController.updatePerfil(req, res));
