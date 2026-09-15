import { prisma } from '../prisma';

export interface UpdateContactoDto {
  telefono?: string;
  email?: string;
}

export class PortalService {
  async getPerfil(personaId: number) {
    const paciente = await prisma.paciente.findUnique({
      where: { id_persona: personaId },
      include: { persona: true },
    });

    if (!paciente) {
      const error: any = new Error('Perfil de paciente no encontrado');
      error.status = 404;
      throw error;
    }

    return {
      id_paciente: paciente.id_paciente,
      id_persona: paciente.id_persona,
      dni: paciente.persona.dni,
      nombre: paciente.persona.nombre,
      apellido: paciente.persona.apellido,
      email: paciente.persona.email,
      telefono: paciente.persona.telefono,
      fecha_nacimiento: paciente.persona.fecha_nacimiento,
      obra_social: paciente.obra_social,
      activo: paciente.activo,
    };
  }

  async updateContacto(personaId: number, dto: UpdateContactoDto) {
    const paciente = await prisma.paciente.findUnique({
      where: { id_persona: personaId },
      include: { persona: true },
    });

    if (!paciente) {
      const error: any = new Error('Perfil de paciente no encontrado');
      error.status = 404;
      throw error;
    }

    const updates: { telefono?: string; email?: string } = {};

    if (dto.telefono !== undefined) {
      const telTrim = dto.telefono ? dto.telefono.trim() : '';
      if (telTrim && !/^[0-9+\s-]{7,20}$/.test(telTrim)) {
        const error: any = new Error('El teléfono debe tener entre 7 y 20 caracteres numéricos o símbolos válidos (+, -)');
        error.status = 400;
        throw error;
      }
      updates.telefono = telTrim || null as any;
    }

    if (dto.email !== undefined) {
      const emailTrim = dto.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        const error: any = new Error('El formato del correo electrónico es inválido');
        error.status = 400;
        throw error;
      }

      if (emailTrim !== paciente.persona.email.toLowerCase()) {
        const emailExists = await prisma.persona.findFirst({
          where: {
            email: emailTrim,
            id_persona: { not: personaId },
          },
        });

        if (emailExists) {
          const error: any = new Error('El correo electrónico ya se encuentra registrado por otro usuario');
          error.status = 409;
          throw error;
        }

        updates.email = emailTrim;
      }
    }

    await prisma.persona.update({
      where: { id_persona: personaId },
      data: updates,
    });

    return this.getPerfil(personaId);
  }
}

export const portalService = new PortalService();
