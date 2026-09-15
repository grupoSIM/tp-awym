import { Request, Response } from 'express';
import { agendasService } from '../services/agendas.service';
import { Rol } from '@prisma/client';
import { prisma } from '../prisma';

export class AgendasController {
  async getAgendas(req: Request, res: Response): Promise<void> {
    try {
      const { id_profesional, id_consultorio, dia_semana, estado } = req.query;
      let profesionalId = id_profesional ? parseInt(id_profesional as string, 10) : undefined;

      // Si el usuario es PROFESIONAL, forzar a su propio id_profesional
      if (req.user && req.user.rol === Rol.PROFESIONAL) {
        const profesional = await prisma.profesional.findUnique({
          where: { id_persona: req.user.personaId },
        });
        if (!profesional) {
          res.status(403).json({ error: 'Perfil profesional no vinculado' });
          return;
        }
        profesionalId = profesional.id_profesional;
      }

      const data = await agendasService.getAgendas({
        id_profesional: profesionalId,
        id_consultorio: id_consultorio ? parseInt(id_consultorio as string, 10) : undefined,
        dia_semana: dia_semana !== undefined ? parseInt(dia_semana as string, 10) : undefined,
        estado: typeof estado === 'string' ? estado : undefined,
      });

      res.json(data);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getAgendaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de agenda inválido' });
        return;
      }

      const agenda = await agendasService.getAgendaById(id);

      // Si es rol PROFESIONAL, verificar que pertenezca a sí mismo
      if (req.user && req.user.rol === Rol.PROFESIONAL) {
        const profesional = await prisma.profesional.findUnique({
          where: { id_persona: req.user.personaId },
        });
        if (!profesional || agenda.id_profesional !== profesional.id_profesional) {
          res.status(403).json({ error: 'No posee permisos para ver esta agenda' });
          return;
        }
      }

      res.json(agenda);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async createAgenda(req: Request, res: Response): Promise<void> {
    try {
      let { id_profesional, id_consultorio, dia_semana, hora_inicio, hora_fin, duracion_minutos } = req.body;

      // Si el rol es PROFESIONAL, forzar a su propio id_profesional
      if (req.user && req.user.rol === Rol.PROFESIONAL) {
        const profesional = await prisma.profesional.findUnique({
          where: { id_persona: req.user.personaId },
        });
        if (!profesional) {
          res.status(403).json({ error: 'Perfil profesional no vinculado' });
          return;
        }
        id_profesional = profesional.id_profesional;
      }

      const nueva = await agendasService.createAgenda({
        id_profesional: parseInt(id_profesional, 10),
        id_consultorio: parseInt(id_consultorio, 10),
        dia_semana: parseInt(dia_semana, 10),
        hora_inicio,
        hora_fin,
        duracion_minutos: parseInt(duracion_minutos, 10),
      });

      res.status(201).json(nueva);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al crear agenda médica' });
    }
  }

  async updateAgenda(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de agenda inválido' });
        return;
      }

      let { id_profesional, id_consultorio, dia_semana, hora_inicio, hora_fin, duracion_minutos } = req.body;

      if (req.user && req.user.rol === Rol.PROFESIONAL) {
        const profesional = await prisma.profesional.findUnique({
          where: { id_persona: req.user.personaId },
        });
        const existing = await agendasService.getAgendaById(id);
        if (!profesional || existing.id_profesional !== profesional.id_profesional) {
          res.status(403).json({ error: 'No posee permisos para modificar esta agenda' });
          return;
        }
        id_profesional = profesional.id_profesional;
      }

      const actualizada = await agendasService.updateAgenda(id, {
        id_profesional: parseInt(id_profesional, 10),
        id_consultorio: parseInt(id_consultorio, 10),
        dia_semana: parseInt(dia_semana, 10),
        hora_inicio,
        hora_fin,
        duracion_minutos: parseInt(duracion_minutos, 10),
      });

      res.json(actualizada);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message || 'Error al actualizar agenda médica' });
    }
  }

  async toggleEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de agenda inválido' });
        return;
      }

      const { activo, cancelarTurnosPendientes } = req.body;
      if (typeof activo !== 'boolean') {
        res.status(400).json({ error: 'El campo activo debe ser un booleano' });
        return;
      }

      if (req.user && req.user.rol === Rol.PROFESIONAL) {
        const profesional = await prisma.profesional.findUnique({
          where: { id_persona: req.user.personaId },
        });
        const existing = await agendasService.getAgendaById(id);
        if (!profesional || existing.id_profesional !== profesional.id_profesional) {
          res.status(403).json({ error: 'No posee permisos para modificar el estado de esta agenda' });
          return;
        }
      }

      const actualizada = await agendasService.toggleEstado(id, activo, Boolean(cancelarTurnosPendientes));
      res.json(actualizada);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({
        error: error.message || 'Error al modificar estado de la agenda',
        turnosPendientes: error.turnosPendientes,
      });
    }
  }
}

export const agendasController = new AgendasController();