import { prisma } from '../prisma';

export interface CreateEspecialidadDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateEspecialidadDto {
  nombre: string;
  descripcion?: string;
}

export class EspecialidadesService {
  async getEspecialidades(params: { search?: string; estado?: string }) {
    const where: any = {};

    const estado = params.estado || 'activo';
    if (estado === 'activo') {
      where.activo = true;
    } else if (estado === 'inactivo') {
      where.activo = false;
    }

    if (params.search) {
      const searchTerm = params.search.trim();
      where.OR = [
        { nombre: { contains: searchTerm } },
        { descripcion: { contains: searchTerm } },
      ];
    }

    const data = await prisma.especialidad.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    return data;
  }

  async getEspecialidadById(id: number) {
    const especialidad = await prisma.especialidad.findUnique({
      where: { id_especialidad: id },
    });

    if (!especialidad) {
      throw new Error('Especialidad no encontrada');
    }

    return especialidad;
  }

  async createEspecialidad(dto: CreateEspecialidadDto) {
    const nombre = dto.nombre ? dto.nombre.trim() : '';
    if (nombre.length < 2 || nombre.length > 100) {
      throw new Error('El nombre de la especialidad debe tener entre 2 y 100 caracteres');
    }

    const existing = await prisma.especialidad.findFirst({
      where: { nombre },
    });

    if (existing) {
      const error: any = new Error('Ya existe una especialidad con ese nombre');
      error.status = 409;
      throw error;
    }

    return prisma.especialidad.create({
      data: {
        nombre,
        descripcion: dto.descripcion ? dto.descripcion.trim() : null,
      },
    });
  }

  async updateEspecialidad(id: number, dto: UpdateEspecialidadDto) {
    const existing = await prisma.especialidad.findUnique({
      where: { id_especialidad: id },
    });

    if (!existing) {
      const error: any = new Error('Especialidad no encontrada');
      error.status = 404;
      throw error;
    }

    const nombre = dto.nombre ? dto.nombre.trim() : '';
    if (nombre.length < 2 || nombre.length > 100) {
      throw new Error('El nombre de la especialidad debe tener entre 2 y 100 caracteres');
    }

    if (nombre.toLowerCase() !== existing.nombre.toLowerCase()) {
      const duplicate = await prisma.especialidad.findFirst({
        where: {
          nombre,
          id_especialidad: { not: id },
        },
      });

      if (duplicate) {
        const error: any = new Error('Ya existe una especialidad con ese nombre');
        error.status = 409;
        throw error;
      }
    }

    return prisma.especialidad.update({
      where: { id_especialidad: id },
      data: {
        nombre,
        descripcion: dto.descripcion ? dto.descripcion.trim() : null,
      },
    });
  }

  async toggleEstado(id: number, activo: boolean) {
    const existing = await prisma.especialidad.findUnique({
      where: { id_especialidad: id },
    });

    if (!existing) {
      const error: any = new Error('Especialidad no encontrada');
      error.status = 404;
      throw error;
    }

    return prisma.especialidad.update({
      where: { id_especialidad: id },
      data: { activo },
    });
  }
}

export const especialidadesService = new EspecialidadesService();
