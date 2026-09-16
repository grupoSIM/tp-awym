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
