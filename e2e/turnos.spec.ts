import { test, expect } from '@playwright/test';

test.describe('Portal de Paciente y Reserva de Turnos', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como Paciente
    await page.goto('/login');
    await page.fill('#dni', '22222222');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('debe acceder a la sección de Mis Turnos y visualizar las pestañas', async ({ page }) => {
    await page.goto('/turnos');
    await expect(page.locator('h1')).toContainText('Mis Turnos Médicos');
    await expect(page.locator('#tab-proximos')).toBeVisible();
    await expect(page.locator('button:has-text("Historial")')).toBeVisible();
  });

  test('debe permitir consultar disponibilidad en el formulario de reserva de turnos', async ({ page }) => {
    await page.goto('/turnos/reservar');
    await expect(page.locator('h1')).toContainText('Solicitar y Reservar Turno Médico');

    // Seleccionar especialidad
    const especialidadSelect = page.locator('#especialidadId');
    await expect(especialidadSelect).toBeVisible();
    // Esperar a que carguen las opciones
    await expect(especialidadSelect.locator('option')).not.toHaveCount(1);
    await especialidadSelect.selectOption({ index: 1 });

    // Ingresar una fecha futura (ej. dentro de 7 días)
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 7);
    const fechaIso = fechaFutura.toISOString().split('T')[0];
    await page.fill('#fecha', fechaIso);

    // Buscar disponibilidad
    await page.click('button:has-text("Buscar Horarios Disponibles")');

    // Verificar que la búsqueda se realizó y presenta resultados o alerta informativa
    const resultadosContainer = page.locator('h2:has-text("Horarios Disponibles"), .alert');
    await expect(resultadosContainer.first()).toBeVisible();
  });
});
