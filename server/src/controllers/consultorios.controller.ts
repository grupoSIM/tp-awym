import { Request, Response } from 'express';
import { consultoriosService } from '../services/consultorios.service';

export class ConsultoriosController {
  async getConsultorios(req: Request, res: Response): Promise<void> {
    try {
      const { search, estado } = req.query;
      const data = await consultoriosService.getConsultorios({
        search: typeof search === 'string' ? search : undefined,
        estado: typeof estado === 'string' ? estado : undefined,
      });
      res.json(data);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getConsultorioById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de consultorio inválido' });
        return;
      }

      const consultorio = await consultoriosService.getConsultorioById(id);
      res.json(consultorio);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async createConsultorio(req: Request, res: Response): Promise<void> {
    try {
      const { numero, ubicacion, piso } = req.body;
      if (!numero) {
        res.status(400).json({ error: 'El número de consultorio es obligatorio' });
        return;
      }

      const nuevo = await consultoriosService.createConsultorio({ numero, ubicacion, piso });
      res.status(201).json(nuevo);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al crear consultorio' });
    }
  }

  async updateConsultorio(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de consultorio inválido' });
        return;
      }

      const { numero, ubicacion, piso } = req.body;
      if (!numero) {
        res.status(400).json({ error: 'El número de consultorio es obligatorio' });
        return;
      }

      const actualizado = await consultoriosService.updateConsultorio(id, { numero, ubicacion, piso });
      res.json(actualizado);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al actualizar consultorio' });
    }
  }

  async toggleEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de consultorio inválido' });
        return;
      }

      const { activo } = req.body;
      if (typeof activo !== 'boolean') {
        res.status(400).json({ error: 'El campo activo debe ser un booleano' });
        return;
      }

      const actualizado = await consultoriosService.toggleEstado(id, activo);
      res.json(actualizado);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al modificar estado' });
    }
  }
}

export const consultoriosController = new ConsultoriosController();