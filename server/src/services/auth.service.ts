import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { Rol, EstadoUsuario } from '@prisma/client';
import { UserSessionPayload } from '../types/auth';

const BCRYPT_SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'turnos-secret-key-default-2026';
const SESSION_EXPIRES_IN = '8h';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: UserSessionPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRES_IN });
  }

  verifyToken(token: string): UserSessionPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
    } catch {
      return null;
    }
  }

  async login(dni: string, password: string): Promise<{ user: UserSessionPayload; token: string }> {
    if (!dni || !password) {
      throw new Error('DNI y contraseña requeridos');
    }

    const persona = await prisma.persona.findUnique({
      where: { dni },
      include: { usuario: true },
    });

    if (!persona || !persona.usuario) {
      throw new Error('Credenciales inválidas');
    }

    if (persona.usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new Error('Cuenta inactiva');
    }

    const passwordMatch = await this.comparePassword(password, persona.usuario.password_hash);
    if (!passwordMatch) {
      throw new Error('Credenciales inválidas');
    }

    const payload: UserSessionPayload = {
      userId: persona.usuario.id_usuario,
      personaId: persona.id_persona,
      dni: persona.dni,
      nombre: persona.nombre,
      apellido: persona.apellido,
      rol: persona.usuario.rol,
    };

    const token = this.generateToken(payload);
    return { user: payload, token };
  }

  async createUserWithPersona(data: {
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    fecha_nacimiento: Date;
    telefono?: string;
    password: string;
    rol?: Rol;
  }) {
    const password_hash = await this.hashPassword(data.password);

    return prisma.persona.create({
      data: {
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        fecha_nacimiento: data.fecha_nacimiento,
        telefono: data.telefono,
        usuario: {
          create: {
            password_hash,
            rol: data.rol || Rol.PACIENTE,
            estado: EstadoUsuario.ACTIVO,
          },
        },
      },
      include: { usuario: true },
    });
  }
}

export const authService = new AuthService();
