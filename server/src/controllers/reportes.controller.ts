import { Request, Response } from 'express';
import { reportesService, FiltrosReporte } from '../services/reportes.service';

export class ReportesController {
  private extraerFiltros(req: Request): FiltrosReporte {
    const { desde, hasta, especialidadId, profesionalId } = req.query;

    return {
      desde: typeof desde === 'string' && desde.trim() ? desde.trim() : undefined,
      hasta: typeof hasta === 'string' && hasta.trim() ? hasta.trim() : undefined,
      especialidadId: especialidadId ? Number(especialidadId) : undefined,
      profesionalId: profesionalId ? Number(profesionalId) : undefined,
    };
  }

  async getResumen(req: Request, res: Response): Promise<void> {
    try {
      const filtros = this.extraerFiltros(req);
      const resumen = await reportesService.getResumen(filtros);
      res.json(resumen);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error al obtener resumen de reportes' });
    }
  }

  async getPorEspecialidades(req: Request, res: Response): Promise<void> {
    try {
      const filtros = this.extraerFiltros(req);
      const especialidades = await reportesService.getPorEspecialidades(filtros);
      res.json(especialidades);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error al obtener reporte por especialidades' });
    }
  }

  async getPorProfesionales(req: Request, res: Response): Promise<void> {
    try {
      const filtros = this.extraerFiltros(req);
      const profesionales = await reportesService.getPorProfesionales(filtros);
      res.json(profesionales);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error al obtener reporte por profesionales' });
    }
  }

  async exportarCsv(req: Request, res: Response): Promise<void> {
    try {
      const filtros = this.extraerFiltros(req);
      const csv = await reportesService.generarCsv(filtros);

      const filename = `reporte_turnos_${filtros.desde || 'inicio'}_${filtros.hasta || 'fin'}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({ error: error.message || 'Error al exportar reporte a CSV' });
    }
  }
}

export const reportesController = new ReportesController();
