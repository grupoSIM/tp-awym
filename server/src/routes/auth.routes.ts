import { Router, Request, Response } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => authController.login(req, res));
authRouter.post('/logout', (req: Request, res: Response) => authController.logout(req, res));
authRouter.get('/me', authenticate, (req: Request, res: Response) => authController.me(req, res));

// Endpoints de prueba RBAC
authRouter.get('/admin-only', authenticate, requireRole(Rol.ADMIN), (_req: Request, res: Response) => {
  res.status(200).json({ access: 'granted', role: Rol.ADMIN });
});

authRouter.get('/paciente-only', authenticate, requireRole(Rol.PACIENTE), (_req: Request, res: Response) => {
  res.status(200).json({ access: 'granted', role: Rol.PACIENTE });
});
