import { Router } from 'express';
import { reportesController } from '../controllers/reportes.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const reportesRouter = Router();

// Todas las rutas de reportes requieren autenticación y rol ADMIN exclusivo
reportesRouter.use(authenticate);
reportesRouter.use(requireRole(Rol.ADMIN));

reportesRouter.get('/resumen', (req, res) => reportesController.getResumen(req, res));
reportesRouter.get('/especialidades', (req, res) => reportesController.getPorEspecialidades(req, res));
reportesRouter.get('/profesionales', (req, res) => reportesController.getPorProfesionales(req, res));
reportesRouter.get('/exportar', (req, res) => reportesController.exportarCsv(req, res));
