export type UserRole = 'PACIENTE' | 'PROFESIONAL' | 'RECEPCIONISTA' | 'ADMIN';

export interface User {
  id: number;
  personaId: number;
  dni: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
}

export interface AuthResponse {
  user: User;
}
