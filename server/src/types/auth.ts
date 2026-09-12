import { Rol } from '@prisma/client';

export interface UserSessionPayload {
  userId: number;
  personaId: number;
  dni: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSessionPayload;
    }
  }
}
