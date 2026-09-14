export interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}
