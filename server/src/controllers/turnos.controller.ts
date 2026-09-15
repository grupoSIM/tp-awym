import { Request, Response } from 'express';
import { turnosService } from '../services/turnos.service';
import { EstadoTurno } from '@prisma/client';

export class TurnosController {
  async getDisponibilidad(req: Request, res: Response): Promise<void> {
    try {
      const { especialidadId, profesionalId, fecha } = req.query;

      if (!fecha || typeof fecha !== 'string') {
        res.status(400).json({ error: 'El parámetro fecha es requerido en formato YYYY-MM-DD' });
        return;
      }

      const slots = await turnosService.getDisponibilidad({
        especialidadId: especialidadId ? parseInt(especialidadId as string, 10) : undefined,
        profesionalId: profesionalId ? parseInt(profesionalId as string, 10) : undefined,
        fecha,
      });

      res.json(slots);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async createTurno(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { id_profesional, id_especialidad, fecha, hora_inicio, hora_fin, motivo_consulta, id_paciente, id_agenda, id_consultorio } = req.body;

      if (!id_profesional || !id_especialidad || !fecha || !hora_inicio || !hora_fin) {
        res.status(400).json({ error: 'Faltan campos obligatorios para registrar el turno' });
        return;
      }

      const turno = await turnosService.reservarTurno(
        {
          id_profesional: Number(id_profesional),
          id_especialidad: Number(id_especialidad),
          fecha,
          hora_inicio,
          hora_fin,
          motivo_consulta,
          id_paciente: id_paciente ? Number(id_paciente) : undefined,
          id_agenda: id_agenda ? Number(id_agenda) : undefined,
          id_consultorio: id_consultorio ? Number(id_consultorio) : undefined,
        },
        req.user
      );

      res.status(201).json(turno);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getTurnos(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { pacienteId, profesionalId, fecha, fecha_desde, fecha_hasta, estado, tipo, especialidadId, consultorioId, search } = req.query;

      const turnos = await turnosService.getTurnos(
        {
          pacienteId: pacienteId ? parseInt(pacienteId as string, 10) : undefined,
          profesionalId: profesionalId ? parseInt(profesionalId as string, 10) : undefined,
          fecha: typeof fecha === 'string' ? fecha : undefined,
          fecha_desde: typeof fecha_desde === 'string' ? fecha_desde : undefined,
          fecha_hasta: typeof fecha_hasta === 'string' ? fecha_hasta : undefined,
          estado: typeof estado === 'string' ? (estado as EstadoTurno) : undefined,
          tipo: typeof tipo === 'string' ? (tipo as 'proximos' | 'historial' | 'todos') : undefined,
          especialidadId: especialidadId ? parseInt(especialidadId as string, 10) : undefined,
          consultorioId: consultorioId ? parseInt(consultorioId as string, 10) : undefined,
          search: typeof search === 'string' ? search : undefined,
        },
        req.user
      );

      res.json(turnos);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async getTurnoById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de turno inválido' });
        return;
      }

      const turno = await turnosService.getTurnoById(id, req.user);
      res.json(turno);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async cancelarTurno(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de turno inválido' });
        return;
      }

      const { motivo } = req.body || {};
      const turno = await turnosService.cancelarTurno(id, req.user, motivo);
      res.json(turno);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async reprogramarTurno(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de turno inválido' });
        return;
      }

      const { fecha, hora_inicio, hora_fin, id_profesional, motivo } = req.body;
      const turno = await turnosService.reprogramarTurno(
        id,
        {
          fecha,
          hora_inicio,
          hora_fin,
          id_profesional,
          motivo,
        },
        req.user
      );
      res.json(turno);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  async actualizarEstado(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de turno inválido' });
        return;
      }

      const { estado, observacion } = req.body;
      const turno = await turnosService.actualizarEstado(
        id,
        {
          estado,
          observacion,
        },
        req.user
      );
      res.json(turno);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
  }
}

export const turnosController = new TurnosController();
