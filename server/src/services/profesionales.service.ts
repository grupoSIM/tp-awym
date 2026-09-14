import { prisma } from '../prisma';

export interface CreateProfesionalDto {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: Date | string;
  matricula: string;
  especialidades: number[];
}

export interface UpdateProfesionalDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: Date | string;
  matricula: string;
  especialidades: number[];
}

export class ProfesionalesService {
  private validatePersonaFields(dto: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_nacimiento: Date | string;
  }) {
    const nombre = dto.nombre?.trim();
    const apellido = dto.apellido?.trim();
    const email = dto.email?.trim().toLowerCase();

    if (!nombre || nombre.length < 2 || nombre.length > 50) {
      throw new Error('El nombre debe tener entre 2 y 50 caracteres');
    }

    if (!apellido || apellido.length < 2 || apellido.length > 50) {
      throw new Error('El apellido debe tener entre 2 y 50 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('El formato del correo electrónico es inválido');
    }

    if (dto.telefono) {
      const tel = dto.telefono.trim();
      const telRegex = /^[0-9+\-\s]{7,20}$/;
      if (!telRegex.test(tel)) {
        throw new Error('El formato del teléfono es inválido');
      }
    }

    const fechaNac = new Date(dto.fecha_nacimiento);
    if (isNaN(fechaNac.getTime())) {
      throw new Error('La fecha de nacimiento es inválida');
    }

    const hoy = new Date();
    if (fechaNac > hoy) {
      throw new Error('La fecha de nacimiento no puede ser futura');
    }

    const edadAnios = (hoy.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (edadAnios > 125 || edadAnios < 18) {
      throw new Error('La edad del profesional debe ser de al menos 18 años y no mayor a 125');
    }
  }

  async getProfesionales(params: {
    search?: string;
    id_especialidad?: number;
    estado?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    const estado = params.estado || 'activo';
    if (estado === 'activo') {
      where.activo = true;
    } else if (estado === 'inactivo') {
      where.activo = false;
    }

    if (params.id_especialidad) {
      where.especialidades = {
        some: {
          id_especialidad: Number(params.id_especialidad),
        },
      };
    }

    if (params.search) {
      const searchTerm = params.search.trim();
      where.OR = [
        { matricula: { contains: searchTerm } },
        { persona: { dni: { contains: searchTerm } } },
        { persona: { nombre: { contains: searchTerm } } },
        { persona: { apellido: { contains: searchTerm } } },
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.profesional.count({ where }),
      prisma.profesional.findMany({
        where,
        skip,
        take: limit,
        include: {
          persona: true,
          especialidades: {
            include: {
              especialidad: true,
            },
          },
        },
        orderBy: { persona: { apellido: 'asc' } },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProfesionalById(id: number) {
    const profesional = await prisma.profesional.findUnique({
      where: { id_profesional: id },
      include: {
        persona: true,
        especialidades: {
          include: {
            especialidad: true,
          },
        },
      },
    });

    if (!profesional) {
      const error: any = new Error('Profesional no encontrado');
      error.status = 404;
      throw error;
    }

    return profesional;
  }

  async createProfesional(dto: CreateProfesionalDto) {
    const dni = dto.dni?.trim();
    if (!dni || !/^\d{7,10}$/.test(dni)) {
      throw new Error('El DNI debe contener entre 7 y 10 dígitos numéricos');
    }

    const matricula = dto.matricula?.trim();
    if (!matricula || matricula.length < 3 || matricula.length > 50) {
      throw new Error('La matrícula es obligatoria y debe tener entre 3 y 50 caracteres');
    }

    if (!Array.isArray(dto.especialidades) || dto.especialidades.length === 0) {
      throw new Error('Debe asignar al menos una especialidad al profesional');
    }

    this.validatePersonaFields(dto);

    return prisma.$transaction(async (tx) => {
      const existingMatricula = await tx.profesional.findUnique({
        where: { matricula },
      });

      if (existingMatricula) {
        const error: any = new Error('Ya existe un profesional con la matrícula ingresada');
        error.status = 409;
        throw error;
      }

      // Validar que existan las especialidades
      const countEspecialidades = await tx.especialidad.count({
        where: { id_especialidad: { in: dto.especialidades } },
      });
      if (countEspecialidades !== dto.especialidades.length) {
        throw new Error('Una o más especialidades seleccionadas no existen');
      }

      let persona = await tx.persona.findUnique({
        where: { dni },
      });

      if (persona) {
        const existingProf = await tx.profesional.findUnique({
          where: { id_persona: persona.id_persona },
        });
        if (existingProf) {
          const error: any = new Error('La persona ya se encuentra registrada como profesional');
          error.status = 409;
          throw error;
        }

        const emailExist = await tx.persona.findFirst({
          where: {
            email: dto.email.trim().toLowerCase(),
            id_persona: { not: persona.id_persona },
          },
        });
        if (emailExist) {
          const error: any = new Error('El correo electrónico ya está registrado por otra persona');
          error.status = 409;
          throw error;
        }

        persona = await tx.persona.update({
          where: { id_persona: persona.id_persona },
          data: {
            nombre: dto.nombre.trim(),
            apellido: dto.apellido.trim(),
            email: dto.email.trim().toLowerCase(),
            telefono: dto.telefono?.trim() || null,
            fecha_nacimiento: new Date(dto.fecha_nacimiento),
          },
        });
      } else {
        const emailExist = await tx.persona.findUnique({
          where: { email: dto.email.trim().toLowerCase() },
        });
        if (emailExist) {
          const error: any = new Error('El correo electrónico ya está registrado en el sistema');
          error.status = 409;
          throw error;
        }

        persona = await tx.persona.create({
          data: {
            dni,
            nombre: dto.nombre.trim(),
            apellido: dto.apellido.trim(),
            email: dto.email.trim().toLowerCase(),
            telefono: dto.telefono?.trim() || null,
            fecha_nacimiento: new Date(dto.fecha_nacimiento),
          },
        });
      }

      const nuevoProfesional = await tx.profesional.create({
        data: {
          id_persona: persona.id_persona,
          matricula,
          especialidades: {
            create: dto.especialidades.map((id_especialidad) => ({
              especialidad: { connect: { id_especialidad } },
            })),
          },
        },
        include: {
          persona: true,
          especialidades: {
            include: { especialidad: true },
          },
        },
      });

      return nuevoProfesional;
    });
  }

  async updateProfesional(id: number, dto: UpdateProfesionalDto) {
    const matricula = dto.matricula?.trim();
    if (!matricula || matricula.length < 3 || matricula.length > 50) {
      throw new Error('La matrícula es obligatoria y debe tener entre 3 y 50 caracteres');
    }

    if (!Array.isArray(dto.especialidades) || dto.especialidades.length === 0) {
      throw new Error('Debe asignar al menos una especialidad al profesional');
    }

    this.validatePersonaFields(dto);

    return prisma.$transaction(async (tx) => {
      const profesional = await tx.profesional.findUnique({
        where: { id_profesional: id },
        include: { persona: true },
      });

      if (!profesional) {
        const error: any = new Error('Profesional no encontrado');
        error.status = 404;
        throw error;
      }

      const matriculaExist = await tx.profesional.findFirst({
        where: {
          matricula,
          id_profesional: { not: id },
        },
      });
      if (matriculaExist) {
        const error: any = new Error('Ya existe otro profesional con esa matrícula');
        error.status = 409;
        throw error;
      }

      const emailExist = await tx.persona.findFirst({
        where: {
          email: dto.email.trim().toLowerCase(),
          id_persona: { not: profesional.id_persona },
        },
      });
      if (emailExist) {
        const error: any = new Error('El correo electrónico ya está registrado por otra persona');
        error.status = 409;
        throw error;
      }

      // Validar especialidades
      const countEspecialidades = await tx.especialidad.count({
        where: { id_especialidad: { in: dto.especialidades } },
      });
      if (countEspecialidades !== dto.especialidades.length) {
        throw new Error('Una o más especialidades seleccionadas no existen');
      }

      await tx.persona.update({
        where: { id_persona: profesional.id_persona },
        data: {
          nombre: dto.nombre.trim(),
          apellido: dto.apellido.trim(),
          email: dto.email.trim().toLowerCase(),
          telefono: dto.telefono?.trim() || null,
          fecha_nacimiento: new Date(dto.fecha_nacimiento),
        },
      });

      // Sincronizar especialidades: eliminar relaciones anteriores y crear nuevas
      await tx.profesionalEspecialidad.deleteMany({
        where: { id_profesional: id },
      });

      const updated = await tx.profesional.update({
        where: { id_profesional: id },
        data: {
          matricula,
          especialidades: {
            create: dto.especialidades.map((id_especialidad) => ({
              especialidad: { connect: { id_especialidad } },
            })),
          },
        },
        include: {
          persona: true,
          especialidades: {
            include: { especialidad: true },
          },
        },
      });

      return updated;
    });
  }

  async toggleEstado(id: number, activo: boolean) {
    const existing = await prisma.profesional.findUnique({
      where: { id_profesional: id },
    });

    if (!existing) {
      const error: any = new Error('Profesional no encontrado');
      error.status = 404;
      throw error;
    }

    return prisma.profesional.update({
      where: { id_profesional: id },
      data: { activo },
      include: {
        persona: true,
        especialidades: {
          include: { especialidad: true },
        },
      },
    });
  }
}

export const profesionalesService = new ProfesionalesService();
