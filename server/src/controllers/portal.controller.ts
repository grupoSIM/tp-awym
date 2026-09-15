import { Request, Response } from 'express';
import { portalService } from '../services/portal.service';

export class PortalController {
  async getPerfil(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const perfil = await portalService.getPerfil(req.user.personaId);
      res.json(perfil);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async updatePerfil(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { telefono, email } = req.body;
      const perfilActualizado = await portalService.updateContacto(req.user.personaId, {
        telefono,
        email,
      });

      res.json(perfilActualizado);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }
}

export const portalController = new PortalController();
