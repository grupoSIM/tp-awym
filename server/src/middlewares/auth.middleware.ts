import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { Rol } from '@prisma/client';

export const COOKIE_SESSION_NAME = 'session_token';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_SESSION_NAME];

  if (!token) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Sesión inválida o expirada' });
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...allowedRoles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
      return;
    }

    next();
  };
}
