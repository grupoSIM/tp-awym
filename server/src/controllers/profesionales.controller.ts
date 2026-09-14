import { Request, Response } from 'express';
import { profesionalesService } from '../services/profesionales.service';
import { Rol } from '@prisma/client';

export class ProfesionalesController {
  async getProfesionales(req: Request, res: Response): Promise<void> {
    try {
      const { search, id_especialidad, estado, page, limit } = req.query;
      const data = await profesionalesService.getProfesionales({
        search: typeof search === 'string' ? search : undefined,
        id_especialidad: id_especialidad ? Number(id_especialidad) : undefined,
        estado: typeof estado === 'string' ? estado : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(data);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getProfesionalById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de profesional inválido' });
        return;
      }

      const profesional = await profesionalesService.getProfesionalById(id);

      // Si es profesional y no es admin/recepcionista, solo puede ver su propio perfil
      if (req.user && req.user.rol === Rol.PROFESIONAL && req.user.id_persona !== profesional.id_persona) {
        res.status(403).json({ error: 'Acceso denegado a datos de otro profesional' });
        return;
      }

      res.json(profesional);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async createProfesional(req: Request, res: Response): Promise<void> {
    try {
      const { dni, nombre, apellido, email, telefono, fecha_nacimiento, matricula, especialidades } = req.body;
      const nuevo = await profesionalesService.createProfesional({
        dni,
        nombre,
        apellido,
        email,
        telefono,
        fecha_nacimiento,
        matricula,
        especialidades,
      });
      res.status(201).json(nuevo);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al crear profesional' });
    }
  }

  async updateProfesional(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de profesional inválido' });
        return;
      }

      const { nombre, apellido, email, telefono, fecha_nacimiento, matricula, especialidades } = req.body;
      const actualizado = await profesionalesService.updateProfesional(id, {
        nombre,
        apellido,
        email,
        telefono,
        fecha_nacimiento,
        matricula,
        especialidades,
      });
      res.json(actualizado);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al actualizar profesional' });
    }
  }

  async toggleEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de profesional inválido' });
        return;
      }

      const { activo } = req.body;
      if (typeof activo !== 'boolean') {
        res.status(400).json({ error: 'El campo activo debe ser un booleano' });
        return;
      }

      const actualizado = await profesionalesService.toggleEstado(id, activo);
      res.json(actualizado);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al modificar estado del profesional' });
    }
  }
}

export const profesionalesController = new ProfesionalesController();
