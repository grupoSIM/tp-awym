export interface Consultorio {
  id_consultorio: number;
  numero: string;
  ubicacion?: string | null;
  piso?: string | null;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CreateConsultorioDto {
  numero: string;
  ubicacion?: string | null;
  piso?: string | null;
}

export interface UpdateConsultorioDto {
  numero: string;
  ubicacion?: string | null;
  piso?: string | null;
}