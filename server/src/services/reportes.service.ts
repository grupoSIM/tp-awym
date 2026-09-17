import { prisma } from '../prisma';
import { EstadoTurno } from '@prisma/client';

export interface FiltrosReporte {
  desde?: string;
  hasta?: string;
  especialidadId?: number;
  profesionalId?: number;
}

export interface IndicadoresResumen {
  desde: string;
  hasta: string;
  totalTurnos: number;
  atendidos: number;
  cancelados: number;
  ausentes: number;
  confirmados: number;
  tasaAusentismo: number;
  tasaCancelacion: number;
  tasaOcupacion: number;
}

export interface DesgloseEspecialidad {
  id_especialidad: number;
  nombre: string;
  totalTurnos: number;
  atendidos: number;
  cancelados: number;
  ausentes: number;
  confirmados: number;
  tasaAusentismo: number;
  tasaCancelacion: number;
  tasaOcupacion: number;
}

export interface DesgloseProfesional {
  id_profesional: number;
  matricula: string;
  nombre_completo: string;
  especialidades: string[];
  totalTurnos: number;
  atendidos: number;
  cancelados: number;
  ausentes: number;
  confirmados: number;
  tasaAusentismo: number;
  tasaCancelacion: number;
  tasaOcupacion: number;
}

export class ReportesService {
  private parseDate(fechaStr: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      const err: any = new Error('Formato de fecha inválido. Utilice YYYY-MM-DD');
      err.status = 400;
      throw err;
    }
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private buildWhereClause(filtros: FiltrosReporte) {
    const where: any = { activo: true };

    if (filtros.desde || filtros.hasta) {
      where.fecha = {};
      if (filtros.desde) {
        where.fecha.gte = this.parseDate(filtros.desde);
      }
      if (filtros.hasta) {
        where.fecha.lte = this.parseDate(filtros.hasta);
      }
    }

    if (filtros.especialidadId) {
      where.id_especialidad = Number(filtros.especialidadId);
    }

    if (filtros.profesionalId) {
      where.id_profesional = Number(filtros.profesionalId);
    }

    return where;
  }

  private calcularTasas(total: number, atendidos: number, cancelados: number, ausentes: number) {
    const cerrados = atendidos + ausentes;
    const tasaAusentismo = cerrados > 0 ? Number(((ausentes / cerrados) * 100).toFixed(2)) : 0;
    const tasaCancelacion = total > 0 ? Number(((cancelados / total) * 100).toFixed(2)) : 0;
    const tasaOcupacion = cerrados > 0 ? Number(((atendidos / cerrados) * 100).toFixed(2)) : 0;

    return {
      tasaAusentismo,
      tasaCancelacion,
      tasaOcupacion,
    };
  }

  async getResumen(filtros: FiltrosReporte): Promise<IndicadoresResumen> {
    const where = this.buildWhereClause(filtros);

    const turnos = await prisma.turno.findMany({
      where,
      select: { estado: true },
    });

    const totalTurnos = turnos.length;
    let atendidos = 0;
    let cancelados = 0;
    let ausentes = 0;
    let confirmados = 0;

    for (const t of turnos) {
      switch (t.estado) {
        case EstadoTurno.ATENDIDO:
          atendidos++;
          break;
        case EstadoTurno.CANCELADO:
          cancelados++;
          break;
        case EstadoTurno.AUSENTE:
          ausentes++;
          break;
        case EstadoTurno.CONFIRMADO:
          confirmados++;
          break;
      }
    }

    const tasas = this.calcularTasas(totalTurnos, atendidos, cancelados, ausentes);

    return {
      desde: filtros.desde || '',
      hasta: filtros.hasta || '',
      totalTurnos,
      atendidos,
      cancelados,
      ausentes,
      confirmados,
      ...tasas,
    };
  }

  async getPorEspecialidades(filtros: FiltrosReporte): Promise<DesgloseEspecialidad[]> {
    const where = this.buildWhereClause(filtros);

    const turnos = await prisma.turno.findMany({
      where,
      select: {
        id_especialidad: true,
        estado: true,
        especialidad: {
          select: { nombre: true },
        },
      },
    });

    const map = new Map<number, { nombre: string; total: number; atendidos: number; cancelados: number; ausentes: number; confirmados: number }>();

    for (const t of turnos) {
      if (!map.has(t.id_especialidad)) {
        map.set(t.id_especialidad, {
          nombre: t.especialidad.nombre,
          total: 0,
          atendidos: 0,
          cancelados: 0,
          ausentes: 0,
          confirmados: 0,
        });
      }
      const entry = map.get(t.id_especialidad)!;
      entry.total++;
      if (t.estado === EstadoTurno.ATENDIDO) entry.atendidos++;
      else if (t.estado === EstadoTurno.CANCELADO) entry.cancelados++;
      else if (t.estado === EstadoTurno.AUSENTE) entry.ausentes++;
      else if (t.estado === EstadoTurno.CONFIRMADO) entry.confirmados++;
    }

    const resultado: DesgloseEspecialidad[] = [];
    for (const [id, data] of map.entries()) {
      const tasas = this.calcularTasas(data.total, data.atendidos, data.cancelados, data.ausentes);
      resultado.push({
        id_especialidad: id,
        nombre: data.nombre,
        totalTurnos: data.total,
        atendidos: data.atendidos,
        cancelados: data.cancelados,
        ausentes: data.ausentes,
        confirmados: data.confirmados,
        ...tasas,
      });
    }

    return resultado.sort((a, b) => b.totalTurnos - a.totalTurnos || a.nombre.localeCompare(b.nombre));
  }

  async getPorProfesionales(filtros: FiltrosReporte): Promise<DesgloseProfesional[]> {
    const where = this.buildWhereClause(filtros);

    const turnos = await prisma.turno.findMany({
      where,
      select: {
        id_profesional: true,
        estado: true,
        profesional: {
          select: {
            matricula: true,
            persona: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
            especialidades: {
              select: {
                especialidad: {
                  select: { nombre: true },
                },
              },
            },
          },
        },
      },
    });

    const map = new Map<number, {
      matricula: string;
      nombre_completo: string;
      especialidades: string[];
      total: number;
      atendidos: number;
      cancelados: number;
      ausentes: number;
      confirmados: number;
    }>();

    for (const t of turnos) {
      if (!map.has(t.id_profesional)) {
        map.set(t.id_profesional, {
          matricula: t.profesional.matricula,
          nombre_completo: `${t.profesional.persona.apellido}, ${t.profesional.persona.nombre}`,
          especialidades: t.profesional.especialidades.map(e => e.especialidad.nombre),
          total: 0,
          atendidos: 0,
          cancelados: 0,
          ausentes: 0,
          confirmados: 0,
        });
      }
      const entry = map.get(t.id_profesional)!;
      entry.total++;
      if (t.estado === EstadoTurno.ATENDIDO) entry.atendidos++;
      else if (t.estado === EstadoTurno.CANCELADO) entry.cancelados++;
      else if (t.estado === EstadoTurno.AUSENTE) entry.ausentes++;
      else if (t.estado === EstadoTurno.CONFIRMADO) entry.confirmados++;
    }

    const resultado: DesgloseProfesional[] = [];
    for (const [id, data] of map.entries()) {
      const tasas = this.calcularTasas(data.total, data.atendidos, data.cancelados, data.ausentes);
      resultado.push({
        id_profesional: id,
        matricula: data.matricula,
        nombre_completo: data.nombre_completo,
        especialidades: data.especialidades,
        totalTurnos: data.total,
        atendidos: data.atendidos,
        cancelados: data.cancelados,
        ausentes: data.ausentes,
        confirmados: data.confirmados,
        ...tasas,
      });
    }

    return resultado.sort((a, b) => b.totalTurnos - a.totalTurnos || a.nombre_completo.localeCompare(b.nombre_completo));
  }

  async generarCsv(filtros: FiltrosReporte): Promise<string> {
    const resumen = await this.getResumen(filtros);
    const especialidades = await this.getPorEspecialidades(filtros);
    const profesionales = await this.getPorProfesionales(filtros);

    const escapeCsv = (str: any) => `"${String(str ?? '').replace(/"/g, '""')}"`;
    const formatFechaCsv = (f?: string) => {
      if (!f) return '';
      const clean = f.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
      return f;
    };

    const lineas: string[] = [];
    lineas.push('\uFEFF"REPORTE DE GESTIÓN Y AUSENTISMO - CENTRO DE SALUD"');
    lineas.push(`"Período consultado:","${formatFechaCsv(filtros.desde) || 'Inicio'} hasta ${formatFechaCsv(filtros.hasta) || 'Fin'}"`);
    lineas.push('');
    lineas.push('"RESUMEN GENERAL"');
    lineas.push('"Total Turnos","Atendidos","Cancelados","Ausentes","Confirmados","% Ausentismo","% Cancelación","% Ocupación"');
    lineas.push([
      resumen.totalTurnos,
      resumen.atendidos,
      resumen.cancelados,
      resumen.ausentes,
      resumen.confirmados,
      `${resumen.tasaAusentismo}%`,
      `${resumen.tasaCancelacion}%`,
      `${resumen.tasaOcupacion}%`
    ].map(escapeCsv).join(','));

    lineas.push('');
    lineas.push('"DESGLOSE POR ESPECIALIDAD"');
    lineas.push('"Especialidad","Total Turnos","Atendidos","Cancelados","Ausentes","Confirmados","% Ausentismo","% Cancelación","% Ocupación"');
    for (const esp of especialidades) {
      lineas.push([
        esp.nombre,
        esp.totalTurnos,
        esp.atendidos,
        esp.cancelados,
        esp.ausentes,
        esp.confirmados,
        `${esp.tasaAusentismo}%`,
        `${esp.tasaCancelacion}%`,
        `${esp.tasaOcupacion}%`
      ].map(escapeCsv).join(','));
    }

    lineas.push('');
    lineas.push('"DESGLOSE POR PROFESIONAL"');
    lineas.push('"Profesional","Matrícula","Especialidades","Total Turnos","Atendidos","Cancelados","Ausentes","Confirmados","% Ausentismo","% Cancelación","% Ocupación"');
    for (const prof of profesionales) {
      lineas.push([
        prof.nombre_completo,
        prof.matricula,
        prof.especialidades.join(' / '),
        prof.totalTurnos,
        prof.atendidos,
        prof.cancelados,
        prof.ausentes,
        prof.confirmados,
        `${prof.tasaAusentismo}%`,
        `${prof.tasaCancelacion}%`,
        `${prof.tasaOcupacion}%`
      ].map(escapeCsv).join(','));
    }

    return lineas.join('\r\n');
  }
}

export const reportesService = new ReportesService();
