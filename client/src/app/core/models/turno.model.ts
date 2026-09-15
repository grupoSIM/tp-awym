export type EstadoTurno = 'CONFIRMADO' | 'CANCELADO' | 'ATENDIDO' | 'AUSENTE';

export interface Turno {
  id_turno: number;
  id_paciente: number;
  id_profesional: number;
  id_especialidad: number;
  id_agenda?: number | null;
  id_consultorio?: number | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoTurno;
  motivo_consulta?: string | null;
  activo: boolean;
  paciente?: {
    id_paciente: number;
    obra_social: string;
    persona: {
      dni: string;
      nombre: string;
      apellido: string;
      telefono?: string | null;
      email: string;
    };
  };
  profesional?: {
    id_profesional: number;
    matricula: string;
    persona: {
      nombre: string;
      apellido: string;
    };
  };
  especialidad?: {
    id_especialidad: number;
    nombre: string;
  };
  consultorio?: {
    id_consultorio: number;
    numero: string;
    ubicacion?: string | null;
    piso?: string | null;
  } | null;
}

export interface FranjaDisponibilidad {
  id_agenda: number;
  id_profesional: number;
  profesional: {
    id_profesional: number;
    matricula: string;
    nombre: string;
    apellido: string;
    especialidades?: { id_especialidad: number; nombre: string }[];
  };
  id_consultorio: number;
  consultorio: {
    id_consultorio: number;
    numero: string;
    ubicacion?: string | null;
    piso?: string | null;
  };
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
}
