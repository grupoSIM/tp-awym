import { prisma } from '../prisma';
import { Rol, EstadoTurno } from '@prisma/client';
import { UserSessionPayload } from '../types/auth';

export interface CreateTurnoDto {
  id_profesional: number;
  id_especialidad: number;
  fecha: string; // "YYYY-MM-DD"
  hora_inicio: string; // "HH:mm"
  hora_fin: string; // "HH:mm"
  motivo_consulta?: string;
  id_paciente?: number;
  id_agenda?: number;
  id_consultorio?: number;
}

export class TurnosService {
  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private parseDate(fechaStr: string): { year: number; month: number; day: number; dateUtc: Date; targetDate: Date; diaSemana: number } {
    if (!fechaStr || !/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      const error: any = new Error('La fecha debe tener un formato válido YYYY-MM-DD');
      error.status = 400;
      throw error;
    }

    const [year, month, day] = fechaStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dateUtc = new Date(Date.UTC(year, month - 1, day));

    const dayOfWeek = targetDate.getDay();
    const diaSemana = dayOfWeek === 0 ? 7 : dayOfWeek; // 1=Lunes .. 7=Domingo

    return { year, month, day, dateUtc, targetDate, diaSemana };
  }

  async getDisponibilidad(params: { especialidadId?: number; profesionalId?: number; fecha: string }) {
    const { year, month, day, dateUtc, targetDate, diaSemana } = this.parseDate(params.fecha);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate < today) {
      const error: any = new Error('La fecha seleccionada no puede ser anterior al día actual');
      error.status = 400;
      throw error;
    }

    const whereAgendas: any = {
      dia_semana: diaSemana,
      activo: true,
      profesional: {
        activo: true,
      },
      consultorio: {
        activo: true,
      },
    };

    if (params.profesionalId) {
      whereAgendas.id_profesional = params.profesionalId;
    }

    if (params.especialidadId) {
      whereAgendas.profesional = {
        ...whereAgendas.profesional,
        especialidades: {
          some: {
            id_especialidad: params.especialidadId,
          },
        },
      };
    }

    const agendas = await prisma.agenda.findMany({
      where: whereAgendas,
      include: {
        profesional: {
          include: {
            persona: true,
            especialidades: {
              include: { especialidad: true },
            },
          },
        },
        consultorio: true,
      },
      orderBy: [{ hora_inicio: 'asc' }],
    });

    const turnosConfirmados = await prisma.turno.findMany({
      where: {
        fecha: dateUtc,
        estado: EstadoTurno.CONFIRMADO,
        activo: true,
        ...(params.profesionalId ? { id_profesional: params.profesionalId } : {}),
      },
    });

    const now = new Date();
    const isToday = targetDate.getTime() === today.getTime();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const franjasDisponibles: any[] = [];

    for (const agenda of agendas) {
      const startMin = this.timeToMinutes(agenda.hora_inicio);
      const endMin = this.timeToMinutes(agenda.hora_fin);
      const duration = agenda.duracion_minutos;

      for (let slotStart = startMin; slotStart + duration <= endMin; slotStart += duration) {
        const slotEnd = slotStart + duration;
        const slotStartStr = this.minutesToTime(slotStart);
        const slotEndStr = this.minutesToTime(slotEnd);

        // Si es hoy, excluir franjas pasadas
        if (isToday && slotStart <= currentMinutes) {
          continue;
        }

        // Verificar si colisiona con algún turno confirmado del mismo profesional
        const ocupado = turnosConfirmados.some((t) => {
          if (t.id_profesional !== agenda.id_profesional) return false;
          const tStart = this.timeToMinutes(t.hora_inicio);
          const tEnd = this.timeToMinutes(t.hora_fin);
          return slotStart < tEnd && slotEnd > tStart;
        });

        if (!ocupado) {
          franjasDisponibles.push({
            id_agenda: agenda.id_agenda,
            id_profesional: agenda.id_profesional,
            profesional: {
              id_profesional: agenda.profesional.id_profesional,
              matricula: agenda.profesional.matricula,
              nombre: agenda.profesional.persona.nombre,
              apellido: agenda.profesional.persona.apellido,
              especialidades: agenda.profesional.especialidades.map((e) => e.especialidad),
            },
            id_consultorio: agenda.id_consultorio,
            consultorio: {
              id_consultorio: agenda.consultorio.id_consultorio,
              numero: agenda.consultorio.numero,
              ubicacion: agenda.consultorio.ubicacion,
              piso: agenda.consultorio.piso,
            },
            fecha: params.fecha,
            hora_inicio: slotStartStr,
            hora_fin: slotEndStr,
            duracion_minutos: duration,
          });
        }
      }
    }

    return franjasDisponibles;
  }

  async reservarTurno(dto: CreateTurnoDto, user: UserSessionPayload) {
    let pacienteId: number;

    if (user.rol === Rol.PACIENTE) {
      const paciente = await prisma.paciente.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!paciente || !paciente.activo) {
        const error: any = new Error('Perfil de paciente no encontrado o inactivo');
        error.status = 404;
        throw error;
      }
      pacienteId = paciente.id_paciente;
    } else if (user.rol === Rol.RECEPCIONISTA || user.rol === Rol.ADMIN) {
      if (!dto.id_paciente) {
        const error: any = new Error('Debe especificar id_paciente para registrar el turno');
        error.status = 400;
        throw error;
      }
      const paciente = await prisma.paciente.findUnique({
        where: { id_paciente: Number(dto.id_paciente) },
      });
      if (!paciente || !paciente.activo) {
        const error: any = new Error('El paciente especificado no existe o se encuentra inactivo');
        error.status = 404;
        throw error;
      }
      pacienteId = paciente.id_paciente;
    } else {
      const error: any = new Error('Los profesionales no tienen permisos para solicitar turnos en nombre de pacientes');
      error.status = 403;
      throw error;
    }

    const { dateUtc, targetDate, diaSemana } = this.parseDate(dto.fecha);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate < today) {
      const error: any = new Error('La fecha seleccionada no puede ser anterior al día actual');
      error.status = 400;
      throw error;
    }

    const slotStart = this.timeToMinutes(dto.hora_inicio);
    const slotEnd = this.timeToMinutes(dto.hora_fin);

    if (slotStart >= slotEnd) {
      const error: any = new Error('La hora de inicio debe ser anterior a la hora de fin');
      error.status = 400;
      throw error;
    }

    // Validar profesional y especialidad
    const profEsp = await prisma.profesionalEspecialidad.findUnique({
      where: {
        id_profesional_id_especialidad: {
          id_profesional: Number(dto.id_profesional),
          id_especialidad: Number(dto.id_especialidad),
        },
      },
      include: {
        profesional: true,
        especialidad: true,
      },
    });

    if (!profEsp || !profEsp.profesional.activo || !profEsp.especialidad.activo) {
      const error: any = new Error('El profesional o la especialidad especificada no se encuentran disponibles');
      error.status = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      // 1. Prevención de colisión del profesional
      const turnosProf = await tx.turno.findMany({
        where: {
          id_profesional: Number(dto.id_profesional),
          fecha: dateUtc,
          estado: EstadoTurno.CONFIRMADO,
          activo: true,
        },
      });

      const colisionProf = turnosProf.some((t) => {
        const tStart = this.timeToMinutes(t.hora_inicio);
        const tEnd = this.timeToMinutes(t.hora_fin);
        return slotStart < tEnd && slotEnd > tStart;
      });

      if (colisionProf) {
        const error: any = new Error('El profesional ya cuenta con un turno reservado en esa franja horaria');
        error.status = 409;
        throw error;
      }

      // 2. Prevención de colisión del paciente
      const turnosPac = await tx.turno.findMany({
        where: {
          id_paciente: pacienteId,
          fecha: dateUtc,
          estado: EstadoTurno.CONFIRMADO,
          activo: true,
        },
      });

      const colisionPac = turnosPac.some((t) => {
        const tStart = this.timeToMinutes(t.hora_inicio);
        const tEnd = this.timeToMinutes(t.hora_fin);
        return slotStart < tEnd && slotEnd > tStart;
      });

      if (colisionPac) {
        const error: any = new Error('El paciente ya cuenta con un turno reservado en esa franja horaria');
        error.status = 409;
        throw error;
      }

      // 3. Obtener agenda coincidente si existe
      const agendaCoincidente = await tx.agenda.findFirst({
        where: {
          id_profesional: Number(dto.id_profesional),
          dia_semana: diaSemana,
          activo: true,
          hora_inicio: { lte: dto.hora_inicio },
          hora_fin: { gte: dto.hora_fin },
        },
      });

      const id_agenda = agendaCoincidente?.id_agenda || (dto.id_agenda ? Number(dto.id_agenda) : null);
      const id_consultorio = agendaCoincidente?.id_consultorio || (dto.id_consultorio ? Number(dto.id_consultorio) : null);

      // 4. Prevención de múltiples turnos del mismo paciente en la misma agenda
      if (user.rol === Rol.PACIENTE && id_agenda) {
        const turnoExistenteAgenda = await tx.turno.findFirst({
          where: {
            id_paciente: pacienteId,
            id_agenda: id_agenda,
            estado: EstadoTurno.CONFIRMADO,
            activo: true,
            fecha: { gte: today },
          },
        });

        if (turnoExistenteAgenda) {
          const error: any = new Error('El paciente ya cuenta con un turno confirmado para esta agenda médica');
          error.status = 409;
          throw error;
        }
      }

      return tx.turno.create({
        data: {
          id_paciente: pacienteId,
          id_profesional: Number(dto.id_profesional),
          id_especialidad: Number(dto.id_especialidad),
          id_agenda,
          id_consultorio,
          fecha: dateUtc,
          hora_inicio: dto.hora_inicio,
          hora_fin: dto.hora_fin,
          estado: EstadoTurno.CONFIRMADO,
          motivo_consulta: dto.motivo_consulta ? dto.motivo_consulta.trim() : null,
          activo: true,
        },
        include: {
          paciente: { include: { persona: true } },
          profesional: { include: { persona: true } },
          especialidad: true,
          consultorio: true,
        },
      });
    });
  }

  async getTurnos(
    params: {
      pacienteId?: number;
      profesionalId?: number;
      fecha?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
      estado?: EstadoTurno;
      tipo?: 'proximos' | 'historial' | 'todos';
      especialidadId?: number;
      consultorioId?: number;
      search?: string;
    },
    user: UserSessionPayload
  ) {
    const where: any = {
      activo: true,
    };
    const andConditions: any[] = [];

    if (user.rol === Rol.PACIENTE) {
      const paciente = await prisma.paciente.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!paciente) {
        const error: any = new Error('Perfil de paciente no encontrado');
        error.status = 404;
        throw error;
      }
      where.id_paciente = paciente.id_paciente;
    } else if (user.rol === Rol.PROFESIONAL) {
      const profesional = await prisma.profesional.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!profesional) {
        const error: any = new Error('Perfil profesional no encontrado');
        error.status = 404;
        throw error;
      }
      where.id_profesional = profesional.id_profesional;
    } else if (user.rol === Rol.RECEPCIONISTA || user.rol === Rol.ADMIN) {
      if (params.pacienteId) {
        where.id_paciente = Number(params.pacienteId);
      }
      if (params.profesionalId) {
        where.id_profesional = Number(params.profesionalId);
      }
    }

    if (params.fecha) {
      const { dateUtc } = this.parseDate(params.fecha);
      where.fecha = dateUtc;
    } else if (params.fecha_desde || params.fecha_hasta) {
      where.fecha = where.fecha || {};
      if (params.fecha_desde) {
        const { dateUtc } = this.parseDate(params.fecha_desde);
        where.fecha.gte = dateUtc;
      }
      if (params.fecha_hasta) {
        const { dateUtc } = this.parseDate(params.fecha_hasta);
        where.fecha.lte = dateUtc;
      }
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (params.tipo === 'proximos') {
      if (!where.fecha) {
        where.fecha = { gte: hoy };
      }
      if (!params.estado) {
        where.estado = EstadoTurno.CONFIRMADO;
      } else {
        where.estado = params.estado;
      }
    } else if (params.tipo === 'historial') {
      if (!params.estado) {
        andConditions.push({
          OR: [
            { fecha: { lt: hoy } },
            { estado: { in: [EstadoTurno.CANCELADO, EstadoTurno.ATENDIDO, EstadoTurno.AUSENTE] } },
          ],
        });
      } else {
        where.estado = params.estado;
      }
    } else if (params.estado) {
      where.estado = params.estado;
    }

    if (params.especialidadId) {
      where.id_especialidad = Number(params.especialidadId);
    }

    if (params.consultorioId) {
      where.id_consultorio = Number(params.consultorioId);
    }

    if (params.search) {
      const search = params.search.trim();
      andConditions.push({
        OR: [
          { motivo_consulta: { contains: search } },
          { paciente: { persona: { nombre: { contains: search } } } },
          { paciente: { persona: { apellido: { contains: search } } } },
          { paciente: { persona: { dni: { contains: search } } } },
          { profesional: { persona: { nombre: { contains: search } } } },
          { profesional: { persona: { apellido: { contains: search } } } },
          { profesional: { matricula: { contains: search } } },
          { especialidad: { nombre: { contains: search } } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const orderBy = params.tipo === 'historial'
      ? [{ fecha: 'desc' as const }, { hora_inicio: 'desc' as const }]
      : [{ fecha: 'asc' as const }, { hora_inicio: 'asc' as const }];

    return prisma.turno.findMany({
      where,
      include: {
        paciente: { include: { persona: true } },
        profesional: { include: { persona: true } },
        especialidad: true,
        consultorio: true,
      },
      orderBy,
    });
  }

  async getTurnoById(id: number, user: UserSessionPayload) {
    const turno = await prisma.turno.findUnique({
      where: { id_turno: id },
      include: {
        paciente: { include: { persona: true } },
        profesional: { include: { persona: true } },
        especialidad: true,
        consultorio: true,
      },
    });

    if (!turno) {
      const error: any = new Error('Turno no encontrado');
      error.status = 404;
      throw error;
    }

    if (user.rol === Rol.PACIENTE) {
      const paciente = await prisma.paciente.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!paciente || turno.id_paciente !== paciente.id_paciente) {
        const error: any = new Error('No posee permisos para ver este turno');
        error.status = 403;
        throw error;
      }
    } else if (user.rol === Rol.PROFESIONAL) {
      const profesional = await prisma.profesional.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!profesional || turno.id_profesional !== profesional.id_profesional) {
        const error: any = new Error('No posee permisos para ver este turno');
        error.status = 403;
        throw error;
      }
    }

    return turno;
  }

  async cancelarTurno(id: number, user: UserSessionPayload, motivo?: string) {
    const turno = await prisma.turno.findUnique({
      where: { id_turno: id },
    });

    if (!turno) {
      const error: any = new Error('Turno no encontrado');
      error.status = 404;
      throw error;
    }

    if (user.rol === Rol.PACIENTE) {
      const paciente = await prisma.paciente.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!paciente || turno.id_paciente !== paciente.id_paciente) {
        const error: any = new Error('No posee permisos para cancelar este turno');
        error.status = 403;
        throw error;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaTurno = new Date(turno.fecha);
      fechaTurno.setHours(0, 0, 0, 0);
      if (fechaTurno < hoy) {
        const error: any = new Error('No se pueden cancelar turnos de fechas pasadas');
        error.status = 400;
        throw error;
      }
    } else if (user.rol === Rol.PROFESIONAL) {
      const profesional = await prisma.profesional.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!profesional || turno.id_profesional !== profesional.id_profesional) {
        const error: any = new Error('No posee permisos para cancelar este turno');
        error.status = 403;
        throw error;
      }
    }

    if (turno.estado === EstadoTurno.CANCELADO) {
      const error: any = new Error('El turno ya se encuentra cancelado');
      error.status = 400;
      throw error;
    }

    if (turno.estado === EstadoTurno.ATENDIDO || turno.estado === EstadoTurno.AUSENTE) {
      const error: any = new Error(`No se puede cancelar un turno en estado ${turno.estado}`);
      error.status = 400;
      throw error;
    }

    let actorLabel = 'el usuario';
    if (user.rol === Rol.PACIENTE) {
      actorLabel = 'el paciente';
    } else if (user.rol === Rol.RECEPCIONISTA) {
      const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();
      actorLabel = nombreCompleto ? `recepción (${nombreCompleto})` : 'recepción';
    } else if (user.rol === Rol.ADMIN) {
      const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();
      actorLabel = nombreCompleto ? `administración (${nombreCompleto})` : 'administración';
    } else if (user.rol === Rol.PROFESIONAL) {
      const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();
      actorLabel = nombreCompleto ? `el profesional (${nombreCompleto})` : 'el profesional';
    }

    let baseMotivo = '';
    if (turno.motivo_consulta) {
      const parts = turno.motivo_consulta.split(' | Cancelación:');
      if (!parts[0].startsWith('Cancelación:')) {
        baseMotivo = parts[0].trim();
      }
    }

    const detalleMotivo = motivo && motivo.trim() ? `: ${motivo.trim()}` : '';
    const auditCancel = `Cancelado por ${actorLabel}${detalleMotivo}`;
    const nuevoMotivo = baseMotivo
      ? `${baseMotivo} | Cancelación: ${auditCancel}`.slice(0, 255)
      : `Cancelación: ${auditCancel}`.slice(0, 255);

    return prisma.turno.update({
      where: { id_turno: id },
      data: {
        estado: EstadoTurno.CANCELADO,
        motivo_consulta: nuevoMotivo,
      },
      include: {
        paciente: { include: { persona: true } },
        profesional: { include: { persona: true } },
        especialidad: true,
        consultorio: true,
      },
    });
  }

  async reprogramarTurno(
    id: number,
    data: {
      fecha: string;
      hora_inicio: string;
      hora_fin: string;
      id_profesional?: number;
      motivo?: string;
    },
    user: UserSessionPayload
  ) {
    const turno = await prisma.turno.findUnique({
      where: { id_turno: id },
      include: { profesional: true, paciente: true },
    });

    if (!turno) {
      const error: any = new Error('Turno no encontrado');
      error.status = 404;
      throw error;
    }

    if (user.rol === Rol.PACIENTE) {
      const paciente = await prisma.paciente.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!paciente || turno.id_paciente !== paciente.id_paciente) {
        const error: any = new Error('No posee permisos para reprogramar este turno');
        error.status = 403;
        throw error;
      }
    } else if (user.rol === Rol.PROFESIONAL) {
      const error: any = new Error('El rol profesional no tiene permitido reprogramar turnos');
      error.status = 403;
      throw error;
    }

    if (turno.estado !== EstadoTurno.CONFIRMADO) {
      const error: any = new Error(`Solo se pueden reprogramar turnos en estado CONFIRMADO. Estado actual: ${turno.estado}`);
      error.status = 400;
      throw error;
    }

    const { fecha, hora_inicio, hora_fin, id_profesional, motivo } = data;
    if (!fecha || !hora_inicio || !hora_fin) {
      const error: any = new Error('Fecha, hora_inicio y hora_fin son requeridos');
      error.status = 400;
      throw error;
    }

    const { dateUtc, dayOfWeek } = this.parseDate(fecha);
    const targetProfId = id_profesional ? Number(id_profesional) : turno.id_profesional;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (dateUtc < hoy) {
      const error: any = new Error('No se pueden reprogramar turnos para fechas pasadas');
      error.status = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const agendas = await tx.agenda.findMany({
        where: {
          id_profesional: targetProfId,
          dia_semana: dayOfWeek,
          activo: true,
        },
      });

      const agendaCoincidente = agendas.find(
        (a) => a.hora_inicio <= hora_inicio && a.hora_fin >= hora_fin
      );

      if (!agendaCoincidente) {
        const error: any = new Error('No existe agenda configurada para el profesional en la fecha y franja horaria solicitada');
        error.status = 400;
        throw error;
      }

      const solapamientoProfesional = await tx.turno.findFirst({
        where: {
          id_turno: { not: id },
          id_profesional: targetProfId,
          fecha: dateUtc,
          estado: EstadoTurno.CONFIRMADO,
          activo: true,
          OR: [
            {
              hora_inicio: { lte: hora_inicio },
              hora_fin: { gt: hora_inicio },
            },
            {
              hora_inicio: { lt: hora_fin },
              hora_fin: { gte: hora_fin },
            },
            {
              hora_inicio: { gte: hora_inicio },
              hora_fin: { lte: hora_fin },
            },
          ],
        },
      });

      if (solapamientoProfesional) {
        const error: any = new Error('El profesional ya posee un turno confirmado en esa franja horaria');
        error.status = 409;
        throw error;
      }

      const solapamientoPaciente = await tx.turno.findFirst({
        where: {
          id_turno: { not: id },
          id_paciente: turno.id_paciente,
          fecha: dateUtc,
          estado: EstadoTurno.CONFIRMADO,
          activo: true,
          OR: [
            {
              hora_inicio: { lte: hora_inicio },
              hora_fin: { gt: hora_inicio },
            },
            {
              hora_inicio: { lt: hora_fin },
              hora_fin: { gte: hora_fin },
            },
            {
              hora_inicio: { gte: hora_inicio },
              hora_fin: { lte: hora_fin },
            },
          ],
        },
      });

      if (solapamientoPaciente) {
        const error: any = new Error('El paciente ya posee un turno confirmado en esa franja horaria');
        error.status = 409;
        throw error;
      }

      let actorLabel = 'el usuario';
      if (user.rol === Rol.PACIENTE) {
        actorLabel = 'el paciente';
      } else if (user.rol === Rol.RECEPCIONISTA) {
        const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();
        actorLabel = nombreCompleto ? `recepción (${nombreCompleto})` : 'recepción';
      } else if (user.rol === Rol.ADMIN) {
        const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim();
        actorLabel = nombreCompleto ? `administración (${nombreCompleto})` : 'administración';
      }

      let baseMotivo = '';
      if (turno.motivo_consulta) {
        const parts = turno.motivo_consulta.split(' | Reprogramación:');
        if (!parts[0].startsWith('Reprogramación:')) {
          baseMotivo = parts[0].trim();
        }
      }

      const detalleMotivo = motivo && motivo.trim() ? `: ${motivo.trim()}` : '';
      const auditReprog = `Reprogramado por ${actorLabel}${detalleMotivo}`;
      const nuevoMotivo = baseMotivo
        ? `${baseMotivo} | Reprogramación: ${auditReprog}`.slice(0, 255)
        : `Reprogramación: ${auditReprog}`.slice(0, 255);

      return tx.turno.update({
        where: { id_turno: id },
        data: {
          fecha: dateUtc,
          hora_inicio,
          hora_fin,
          id_profesional: targetProfId,
          id_agenda: agendaCoincidente.id_agenda,
          id_consultorio: agendaCoincidente.id_consultorio,
          motivo_consulta: nuevoMotivo,
        },
        include: {
          paciente: { include: { persona: true } },
          profesional: { include: { persona: true } },
          especialidad: true,
          consultorio: true,
        },
      });
    });
  }

  async actualizarEstado(
    id: number,
    data: {
      estado: EstadoTurno;
      observacion?: string;
    },
    user: UserSessionPayload
  ) {
    const turno = await prisma.turno.findUnique({
      where: { id_turno: id },
    });

    if (!turno) {
      const error: any = new Error('Turno no encontrado');
      error.status = 404;
      throw error;
    }

    if (user.rol === Rol.PACIENTE) {
      const error: any = new Error('Los pacientes no poseen permisos para cambiar el estado operativo de los turnos');
      error.status = 403;
      throw error;
    }

    if (user.rol === Rol.PROFESIONAL) {
      const profesional = await prisma.profesional.findUnique({
        where: { id_persona: user.personaId },
      });
      if (!profesional || turno.id_profesional !== profesional.id_profesional) {
        const error: any = new Error('No posee permisos para modificar turnos de otro profesional');
        error.status = 403;
        throw error;
      }
    }

    const { estado, observacion } = data;
    if (!estado || ![EstadoTurno.ATENDIDO, EstadoTurno.AUSENTE, EstadoTurno.CANCELADO, EstadoTurno.CONFIRMADO].includes(estado)) {
      const error: any = new Error('Estado inválido');
      error.status = 400;
      throw error;
    }

    if (turno.estado === EstadoTurno.CANCELADO || turno.estado === EstadoTurno.ATENDIDO || turno.estado === EstadoTurno.AUSENTE) {
      const error: any = new Error(`El turno ya se encuentra en estado terminal: ${turno.estado}`);
      error.status = 400;
      throw error;
    }

    const observacionStr = observacion ? observacion.trim() : '';
    let nuevoMotivo = turno.motivo_consulta;
    if (observacionStr) {
      nuevoMotivo = turno.motivo_consulta
        ? `${turno.motivo_consulta} | Estado (${estado}): ${observacionStr}`.slice(0, 255)
        : `Estado (${estado}): ${observacionStr}`.slice(0, 255);
    }

    return prisma.turno.update({
      where: { id_turno: id },
      data: {
        estado,
        motivo_consulta: nuevoMotivo,
      },
      include: {
        paciente: { include: { persona: true } },
        profesional: { include: { persona: true } },
        especialidad: true,
        consultorio: true,
      },
    });
  }
}

export const turnosService = new TurnosService();
