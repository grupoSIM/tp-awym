import { Request, Response } from 'express';
import { especialidadesService } from '../services/especialidades.service';

export class EspecialidadesController {
  async getEspecialidades(req: Request, res: Response): Promise<void> {
    try {
      const { search, estado } = req.query;
      const data = await especialidadesService.getEspecialidades({
        search: typeof search === 'string' ? search : undefined,
        estado: typeof estado === 'string' ? estado : undefined,
      });
      res.json(data);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getEspecialidadById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de especialidad inválido' });
        return;
      }

      const especialidad = await especialidadesService.getEspecialidadById(id);
      res.json(especialidad);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async createEspecialidad(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) {
        res.status(400).json({ error: 'El nombre de la especialidad es obligatorio' });
        return;
      }

      const nueva = await especialidadesService.createEspecialidad({ nombre, descripcion });
      res.status(201).json(nueva);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al crear especialidad' });
    }
  }

  async updateEspecialidad(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de especialidad inválido' });
        return;
      }

      const { nombre, descripcion } = req.body;
      if (!nombre) {
        res.status(400).json({ error: 'El nombre de la especialidad es obligatorio' });
        return;
      }

      const actualizada = await especialidadesService.updateEspecialidad(id, { nombre, descripcion });
      res.json(actualizada);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al actualizar especialidad' });
    }
  }

  async toggleEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de especialidad inválido' });
        return;
      }

      const { activo } = req.body;
      if (typeof activo !== 'boolean') {
        res.status(400).json({ error: 'El campo activo debe ser un booleano' });
        return;
      }

      const actualizada = await especialidadesService.toggleEstado(id, activo);
      res.json(actualizada);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al modificar estado' });
    }
  }
}

export const especialidadesController = new EspecialidadesController();
