import { prisma } from '../prisma';
import { EstadoTurno } from '@prisma/client';

export interface CreateAgendaDto {
  id_profesional: number;
  id_consultorio: number;
  dia_semana: number; // 1=Lunes .. 7=Domingo
  hora_inicio: string; // "HH:mm"
  hora_fin: string; // "HH:mm"
  duracion_minutos: number;
}

export interface UpdateAgendaDto {
  id_profesional: number;
  id_consultorio: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
}

export class AgendasService {
  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  private validateHorariosYDuracion(hora_inicio: string, hora_fin: string, duracion_minutos: number) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(hora_inicio) || !timeRegex.test(hora_fin)) {
      const error: any = new Error('Los horarios deben tener el formato válido HH:mm (ej. 08:00)');
      error.status = 400;
      throw error;
    }

    const minInicio = this.timeToMinutes(hora_inicio);
    const minFin = this.timeToMinutes(hora_fin);

    if (minInicio >= minFin) {
      const error: any = new Error('La hora de inicio debe ser anterior a la hora de fin');
      error.status = 400;
      throw error;
    }

    if (!duracion_minutos || duracion_minutos <= 0 || duracion_minutos > (minFin - minInicio)) {
      const error: any = new Error('La duración del turno debe ser mayor a 0 minutos y no superar la franja horaria total');
      error.status = 400;
      throw error;
    }
  }

  async getAgendas(params: {
    id_profesional?: number;
    id_consultorio?: number;
    dia_semana?: number;
    estado?: string;
  }) {
    const where: any = {};

    const estado = params.estado || 'activo';
    if (estado === 'activo') {
      where.activo = true;
    } else if (estado === 'inactivo') {
      where.activo = false;
    }

    if (params.id_profesional) {
      where.id_profesional = params.id_profesional;
    }

    if (params.id_consultorio) {
      where.id_consultorio = params.id_consultorio;
    }

    if (params.dia_semana !== undefined) {
      where.dia_semana = params.dia_semana;
    }

    return prisma.agenda.findMany({
      where,
      include: {
        profesional: {
          include: {
            persona: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        consultorio: true,
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' },
      ],
    });
  }

  async getAgendaById(id: number) {
    const agenda = await prisma.agenda.findUnique({
      where: { id_agenda: id },
      include: {
        profesional: {
          include: {
            persona: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        consultorio: true,
      },
    });

    if (!agenda) {
      const error: any = new Error('Agenda no encontrada');
      error.status = 404;
      throw error;
    }

    return agenda;
  }

  async checkSuperposiciones(
    tx: any,
    id_profesional: number,
    id_consultorio: number,
    dia_semana: number,
    hora_inicio: string,
    hora_fin: string,
    excludeAgendaId?: number
  ) {
    const baseWhere: any = {
      dia_semana,
      activo: true,
    };
    if (excludeAgendaId) {
      baseWhere.id_agenda = { not: excludeAgendaId };
    }

    // 1. Superposición del profesional
    const agendasProfesional = await tx.agenda.findMany({
      where: {
        ...baseWhere,
        id_profesional,
      },
    });

    const minInicio = this.timeToMinutes(hora_inicio);
    const minFin = this.timeToMinutes(hora_fin);

    for (const a of agendasProfesional) {
      const aIni = this.timeToMinutes(a.hora_inicio);
      const aFin = this.timeToMinutes(a.hora_fin);
      if (minInicio < aFin && minFin > aIni) {
        const error: any = new Error(
          `El profesional ya posee una agenda asignada los días ${dia_semana} en el rango ${a.hora_inicio} - ${a.hora_fin}`
        );
        error.status = 409;
        throw error;
      }
    }

    // 2. Superposición del consultorio
    const agendasConsultorio = await tx.agenda.findMany({
      where: {
        ...baseWhere,
        id_consultorio,
      },
    });

    for (const a of agendasConsultorio) {
      const aIni = this.timeToMinutes(a.hora_inicio);
      const aFin = this.timeToMinutes(a.hora_fin);
      if (minInicio < aFin && minFin > aIni) {
        const error: any = new Error(
          `El consultorio ya se encuentra ocupado los días ${dia_semana} en el rango ${a.hora_inicio} - ${a.hora_fin}`
        );
        error.status = 409;
        throw error;
      }
    }
  }

  async createAgenda(dto: CreateAgendaDto) {
    if (!dto.id_profesional || !dto.id_consultorio || dto.dia_semana === undefined) {
      const error: any = new Error('Profesional, consultorio y día de la semana son obligatorios');
      error.status = 400;
      throw error;
    }

    if (dto.dia_semana < 1 || dto.dia_semana > 7) {
      const error: any = new Error('El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)');
      error.status = 400;
      throw error;
    }

    this.validateHorariosYDuracion(dto.hora_inicio, dto.hora_fin, dto.duracion_minutos);

    return prisma.$transaction(async (tx) => {
      const profesional = await tx.profesional.findUnique({
        where: { id_profesional: dto.id_profesional },
      });
      if (!profesional || !profesional.activo) {
        const error: any = new Error('El profesional no existe o se encuentra inactivo');
        error.status = 400;
        throw error;
      }

      const consultorio = await tx.consultorio.findUnique({
        where: { id_consultorio: dto.id_consultorio },
      });
      if (!consultorio || !consultorio.activo) {
        const error: any = new Error('El consultorio no existe o se encuentra inactivo');
        error.status = 400;
        throw error;
      }

      await this.checkSuperposiciones(
        tx,
        dto.id_profesional,
        dto.id_consultorio,
        dto.dia_semana,
        dto.hora_inicio,
        dto.hora_fin
      );

      return tx.agenda.create({
        data: {
          id_profesional: dto.id_profesional,
          id_consultorio: dto.id_consultorio,
          dia_semana: dto.dia_semana,
          hora_inicio: dto.hora_inicio,
          hora_fin: dto.hora_fin,
          duracion_minutos: dto.duracion_minutos,
        },
        include: {
          profesional: {
            include: { persona: true },
          },
          consultorio: true,
        },
      });
    });
  }

  async updateAgenda(id: number, dto: UpdateAgendaDto) {
    if (!dto.id_profesional || !dto.id_consultorio || dto.dia_semana === undefined) {
      const error: any = new Error('Profesional, consultorio y día de la semana son obligatorios');
      error.status = 400;
      throw error;
    }

    if (dto.dia_semana < 1 || dto.dia_semana > 7) {
      const error: any = new Error('El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)');
      error.status = 400;
      throw error;
    }

    this.validateHorariosYDuracion(dto.hora_inicio, dto.hora_fin, dto.duracion_minutos);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.agenda.findUnique({
        where: { id_agenda: id },
      });
      if (!existing) {
        const error: any = new Error('Agenda no encontrada');
        error.status = 404;
        throw error;
      }

      const profesional = await tx.profesional.findUnique({
        where: { id_profesional: dto.id_profesional },
      });
      if (!profesional || !profesional.activo) {
        const error: any = new Error('El profesional no existe o se encuentra inactivo');
        error.status = 400;
        throw error;
      }

      const consultorio = await tx.consultorio.findUnique({
        where: { id_consultorio: dto.id_consultorio },
      });
      if (!consultorio || !consultorio.activo) {
        const error: any = new Error('El consultorio no existe o se encuentra inactivo');
        error.status = 400;
        throw error;
      }

      await this.checkSuperposiciones(
        tx,
        dto.id_profesional,
        dto.id_consultorio,
        dto.dia_semana,
        dto.hora_inicio,
        dto.hora_fin,
        id
      );

      return tx.agenda.update({
        where: { id_agenda: id },
        data: {
          id_profesional: dto.id_profesional,
          id_consultorio: dto.id_consultorio,
          dia_semana: dto.dia_semana,
          hora_inicio: dto.hora_inicio,
          hora_fin: dto.hora_fin,
          duracion_minutos: dto.duracion_minutos,
        },
        include: {
          profesional: {
            include: { persona: true },
          },
          consultorio: true,
        },
      });
    });
  }

  async toggleEstado(id: number, activo: boolean, cancelarTurnosPendientes = false) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.agenda.findUnique({
        where: { id_agenda: id },
      });

      if (!existing) {
        const error: any = new Error('Agenda no encontrada');
        error.status = 404;
        throw error;
      }

      // Si se está desactivando (activo=false), verificar si tiene turnos confirmados pendientes
      if (!activo) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const turnosConfirmados = await tx.turno.count({
          where: {
            id_agenda: id,
            estado: EstadoTurno.CONFIRMADO,
            activo: true,
            fecha: { gte: today },
          },
        });

        if (turnosConfirmados > 0) {
          if (!cancelarTurnosPendientes) {
            const error: any = new Error(
              `La agenda posee ${turnosConfirmados} turno(s) confirmado(s) pendiente(s). Debe confirmar su cancelación para poder desactivarla.`
            );
            error.status = 409;
            error.turnosPendientes = turnosConfirmados;
            throw error;
          }

          // Si confirmó explícitamente la cancelación en lote
          await tx.turno.updateMany({
            where: {
              id_agenda: id,
              estado: EstadoTurno.CONFIRMADO,
              activo: true,
              fecha: { gte: today },
            },
            data: {
              estado: EstadoTurno.CANCELADO,
              motivo_consulta: 'Cancelado automáticamente por baja de agenda médica',
            },
          });
        }
      }

      // Si se está reactivando (activo=true), verificar que no genere conflicto con otra agenda vigente
      if (activo) {
        await this.checkSuperposiciones(
          tx,
          existing.id_profesional,
          existing.id_consultorio,
          existing.dia_semana,
          existing.hora_inicio,
          existing.hora_fin,
          id
        );
      }

      return tx.agenda.update({
        where: { id_agenda: id },
        data: { activo },
      });
    });
  }
}

export const agendasService = new AgendasService();