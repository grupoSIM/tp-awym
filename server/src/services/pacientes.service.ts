import { prisma } from '../prisma';

export interface CreatePacienteDto {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: Date | string;
  obra_social: string;
}

export interface UpdatePacienteDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: Date | string;
  obra_social: string;
}

export class PacientesService {
  async getPacientes(params: {
    search?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.estado === 'activo') {
      where.activo = true;
    } else if (params.estado === 'inactivo') {
      where.activo = false;
    }

    if (params.search) {
      const searchTerm = params.search.trim();
      where.persona = {
        OR: [
          { dni: { contains: searchTerm } },
          { nombre: { contains: searchTerm } },
          { apellido: { contains: searchTerm } },
        ],
      };
    }

    const [total, data] = await prisma.$transaction([
      prisma.paciente.count({ where }),
      prisma.paciente.findMany({
        where,
        skip,
        take: limit,
        include: { persona: true },
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

  async getPacienteById(id: number) {
    const paciente = await prisma.paciente.findUnique({
      where: { id_paciente: id },
      include: { persona: true },
    });

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return paciente;
  }

  private validarDatosPaciente(dto: {
    nombre: string;
    apellido: string;
    email: string;
    fecha_nacimiento: string | Date;
    obra_social: string;
    telefono?: string;
  }): Date {
    const nombre = dto.nombre ? dto.nombre.trim() : '';
    const apellido = dto.apellido ? dto.apellido.trim() : '';
    const obraSocial = dto.obra_social ? dto.obra_social.trim() : '';

    if (!nombre || !apellido || !dto.email || !dto.fecha_nacimiento || !obraSocial) {
      throw new Error('Todos los campos obligatorios deben completarse');
    }

    const regexTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,50}$/;
    if (!regexTexto.test(nombre)) {
      throw new Error('El nombre debe contener entre 2 y 50 letras válidas');
    }
    if (!regexTexto.test(apellido)) {
      throw new Error('El apellido debe contener entre 2 y 50 letras válidas');
    }

    if (obraSocial.length < 3 || obraSocial.length > 100) {
      throw new Error('La obra social debe tener entre 3 y 100 caracteres');
    }

    if (dto.telefono && dto.telefono.trim()) {
      const regexTel = /^\+?[0-9\s-]{7,20}$/;
      if (!regexTel.test(dto.telefono.trim())) {
        throw new Error('El teléfono tiene un formato inválido');
      }
    }

    const fechaNacimiento = new Date(dto.fecha_nacimiento);
    const ahora = new Date();
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 125);

    if (isNaN(fechaNacimiento.getTime()) || fechaNacimiento > ahora) {
      throw new Error('La fecha de nacimiento no puede ser futura ni inválida');
    }
    if (fechaNacimiento < fechaMinima) {
      throw new Error('La fecha de nacimiento no puede superar los 125 años de antigüedad');
    }

    return fechaNacimiento;
  }

  async createPaciente(dto: CreatePacienteDto) {
    const fechaNacimiento = this.validarDatosPaciente(dto);

    return prisma.$transaction(async (tx) => {
      let persona = await tx.persona.findUnique({
        where: { dni: dto.dni },
        include: { paciente: true },
      });

      if (persona) {
        if (persona.paciente) {
          throw new Error('La persona ya se encuentra registrada como paciente');
        }

        persona = await tx.persona.update({
          where: { id_persona: persona.id_persona },
          data: {
            nombre: dto.nombre,
            apellido: dto.apellido,
            email: dto.email,
            telefono: dto.telefono,
            fecha_nacimiento: fechaNacimiento,
          },
          include: { paciente: true },
        });

        const paciente = await tx.paciente.create({
          data: {
            id_persona: persona.id_persona,
            obra_social: dto.obra_social,
            activo: true,
          },
          include: { persona: true },
        });

        return paciente;
      }

      const emailExists = await tx.persona.findUnique({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new Error('El email ya se encuentra registrado por otra persona');
      }

      const nuevo = await tx.persona.create({
        data: {
          dni: dto.dni,
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
          fecha_nacimiento: fechaNacimiento,
          paciente: {
            create: {
              obra_social: dto.obra_social,
              activo: true,
            },
          },
        },
        include: { paciente: true },
      });

      return {
        ...nuevo.paciente!,
        persona: nuevo,
      };
    });
  }

  async updatePaciente(id: number, dto: UpdatePacienteDto) {
    const paciente = await prisma.paciente.findUnique({
      where: { id_paciente: id },
      include: { persona: true },
    });

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    const fechaNacimiento = this.validarDatosPaciente(dto);

    return prisma.$transaction(async (tx) => {
      const emailExists = await tx.persona.findFirst({
        where: {
          email: dto.email,
          id_persona: { not: paciente.id_persona },
        },
      });

      if (emailExists) {
        throw new Error('El email ya pertenece a otra persona');
      }

      await tx.persona.update({
        where: { id_persona: paciente.id_persona },
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
          fecha_nacimiento: fechaNacimiento,
        },
      });

      return tx.paciente.update({
        where: { id_paciente: id },
        data: {
          obra_social: dto.obra_social,
        },
        include: { persona: true },
      });
    });
  }

  async toggleEstado(id: number, activo: boolean) {
    const paciente = await prisma.paciente.findUnique({
      where: { id_paciente: id },
    });

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return prisma.paciente.update({
      where: { id_paciente: id },
      data: { activo },
      include: { persona: true },
    });
  }
}

export const pacientesService = new PacientesService();
