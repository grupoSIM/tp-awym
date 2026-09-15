import { Router } from 'express';
import { turnosController } from '../controllers/turnos.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const turnosRouter = Router();

turnosRouter.use(authenticate);

turnosRouter.get('/disponibilidad', (req, res) => turnosController.getDisponibilidad(req, res));
turnosRouter.post('/', requireRole(Rol.PACIENTE, Rol.RECEPCIONISTA, Rol.ADMIN), (req, res) => turnosController.createTurno(req, res));
turnosRouter.get('/', (req, res) => turnosController.getTurnos(req, res));
turnosRouter.get('/:id', (req, res) => turnosController.getTurnoById(req, res));
turnosRouter.patch('/:id/cancelar', (req, res) => turnosController.cancelarTurno(req, res));
