import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PacientesListComponent } from './features/pacientes/pacientes-list.component';
import { PacienteFormComponent } from './features/pacientes/paciente-form.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'pacientes',
    component: PacientesListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPCIONISTA', 'ADMIN'] },
  },
  {
    path: 'pacientes/nuevo',
    component: PacienteFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPCIONISTA', 'ADMIN'] },
  },
  {
    path: 'pacientes/:id/editar',
    component: PacienteFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPCIONISTA', 'ADMIN'] },
  },
  { path: '**', redirectTo: 'login' },
];
