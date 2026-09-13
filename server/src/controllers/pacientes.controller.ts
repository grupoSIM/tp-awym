import { Request, Response } from 'express';
import { pacientesService } from '../services/pacientes.service';
import { Rol } from '@prisma/client';

export class PacientesController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, estado, page, limit } = req.query;
      const result = await pacientesService.getPacientes({
        search: search as string,
        estado: estado as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al obtener pacientes' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de paciente inválido' });
        return;
      }

      const paciente = await pacientesService.getPacienteById(id);

      // Si es rol PACIENTE, verificar que consulte sus propios datos
      if (req.user?.rol === Rol.PACIENTE && req.user.personaId !== paciente.id_persona) {
        res.status(403).json({ error: 'Acceso denegado: no autorizado a ver este perfil' });
        return;
      }

      res.status(200).json(paciente);
    } catch (error: any) {
      if (error.message === 'Paciente no encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message || 'Error al obtener el paciente' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const nuevo = await pacientesService.createPaciente(req.body);
      res.status(201).json(nuevo);
    } catch (error: any) {
      if (error.message.includes('ya se encuentra registrada')) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message || 'Error al crear paciente' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      // Si es rol PACIENTE, verificar que solo modifique sus propios datos de contacto (no obra social)
      if (req.user?.rol === Rol.PACIENTE) {
        const paciente = await pacientesService.getPacienteById(id);
        if (req.user.personaId !== paciente.id_persona) {
          res.status(403).json({ error: 'Acceso denegado: no puede modificar datos de otro paciente' });
          return;
        }
        // La cobertura médica solo la administra el centro de salud
        req.body.obra_social = paciente.obra_social;
      }

      const actualizado = await pacientesService.updatePaciente(id, req.body);
      res.status(200).json(actualizado);
    } catch (error: any) {
      if (error.message === 'Paciente no encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message || 'Error al actualizar paciente' });
    }
  }

  async toggleEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { activo } = req.body;

      if (isNaN(id) || typeof activo !== 'boolean') {
        res.status(400).json({ error: 'Parámetros inválidos' });
        return;
      }

      const resultado = await pacientesService.toggleEstado(id, activo);
      res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message === 'Paciente no encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message || 'Error al cambiar estado' });
    }
  }
}

export const pacientesController = new PacientesController();
