import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { COOKIE_SESSION_NAME } from '../middlewares/auth.middleware';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { dni, password } = req.body;

      if (!dni || !password) {
        res.status(400).json({ error: 'DNI y contraseña requeridos' });
        return;
      }

      const { user, token } = await authService.login(dni, password);

      res.cookie(COOKIE_SESSION_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 8, // 8 horas
        path: '/',
      });

      res.status(200).json({
        user: {
          id: user.userId,
          personaId: user.personaId,
          dni: user.dni,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol,
        },
      });
    } catch (error: any) {
      if (error.message === 'Cuenta inactiva') {
        res.status(403).json({ error: 'Cuenta inactiva' });
        return;
      }
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(COOKIE_SESSION_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.status(200).json({ message: 'Sesión finalizada con éxito' });
  }

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    res.status(200).json({ user: req.user });
  }
}

export const authController = new AuthController();
