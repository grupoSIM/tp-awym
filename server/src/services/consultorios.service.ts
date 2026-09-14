import { prisma } from '../prisma';

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

export class ConsultoriosService {
  async getConsultorios(params: { search?: string; estado?: string }) {
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
        { numero: { contains: searchTerm } },
        { ubicacion: { contains: searchTerm } },
        { piso: { contains: searchTerm } },
      ];
    }

    return prisma.consultorio.findMany({
      where,
      orderBy: { numero: 'asc' },
    });
  }

  async getConsultorioById(id: number) {
    const consultorio = await prisma.consultorio.findUnique({
      where: { id_consultorio: id },
    });

    if (!consultorio) {
      const error: any = new Error('Consultorio no encontrado');
      error.status = 404;
      throw error;
    }

    return consultorio;
  }

  async createConsultorio(dto: CreateConsultorioDto) {
    const numero = dto.numero ? dto.numero.trim() : '';
    if (numero.length < 1 || numero.length > 50) {
      const error: any = new Error('El número de consultorio es obligatorio y debe tener entre 1 y 50 caracteres');
      error.status = 400;
      throw error;
    }

    const existing = await prisma.consultorio.findFirst({
      where: { numero },
    });

    if (existing) {
      const error: any = new Error('Ya existe un consultorio con ese número');
      error.status = 409;
      throw error;
    }

    return prisma.consultorio.create({
      data: {
        numero,
        ubicacion: dto.ubicacion ? dto.ubicacion.trim() : null,
        piso: dto.piso ? dto.piso.trim() : null,
      },
    });
  }

  async updateConsultorio(id: number, dto: UpdateConsultorioDto) {
    const existing = await prisma.consultorio.findUnique({
      where: { id_consultorio: id },
    });

    if (!existing) {
      const error: any = new Error('Consultorio no encontrado');
      error.status = 404;
      throw error;
    }

    const numero = dto.numero ? dto.numero.trim() : '';
    if (numero.length < 1 || numero.length > 50) {
      const error: any = new Error('El número de consultorio es obligatorio y debe tener entre 1 y 50 caracteres');
      error.status = 400;
      throw error;
    }

    if (numero.toLowerCase() !== existing.numero.toLowerCase()) {
      const duplicate = await prisma.consultorio.findFirst({
        where: {
          numero,
          id_consultorio: { not: id },
        },
      });

      if (duplicate) {
        const error: any = new Error('Ya existe un consultorio con ese número');
        error.status = 409;
        throw error;
      }
    }

    return prisma.consultorio.update({
      where: { id_consultorio: id },
      data: {
        numero,
        ubicacion: dto.ubicacion ? dto.ubicacion.trim() : null,
        piso: dto.piso ? dto.piso.trim() : null,
      },
    });
  }

  async toggleEstado(id: number, activo: boolean) {
    const existing = await prisma.consultorio.findUnique({
      where: { id_consultorio: id },
    });

    if (!existing) {
      const error: any = new Error('Consultorio no encontrado');
      error.status = 404;
      throw error;
    }

    return prisma.consultorio.update({
      where: { id_consultorio: id },
      data: { activo },
    });
  }
}

export const consultoriosService = new ConsultoriosService();