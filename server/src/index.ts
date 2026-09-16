import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { pacientesRouter } from './routes/pacientes.routes';
import { especialidadesRouter } from './routes/especialidades.routes';
import { profesionalesRouter } from './routes/profesionales.routes';
import { consultoriosRouter } from './routes/consultorios.routes';
import { agendasRouter } from './routes/agendas.routes';
import { portalRouter } from './routes/portal.routes';
import { turnosRouter } from './routes/turnos.routes';
import { reportesRouter } from './routes/reportes.routes';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/pacientes', pacientesRouter);
app.use('/api/v1/especialidades', especialidadesRouter);
app.use('/api/v1/profesionales', profesionalesRouter);
app.use('/api/v1/consultorios', consultoriosRouter);
app.use('/api/v1/agendas', agendasRouter);
app.use('/api/v1/portal', portalRouter);
app.use('/api/v1/turnos', turnosRouter);
app.use('/api/v1/reportes', reportesRouter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}
