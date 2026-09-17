import { test, expect } from '@playwright/test';

test.describe('Gestión Administrativa (Pacientes y Agendas)', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como Recepcionista
    await page.goto('/login');
    await page.fill('#dni', '44444444');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('debe listar pacientes y permitir filtrar por término de búsqueda', async ({ page }) => {
    await page.goto('/pacientes');
    await expect(page.locator('h1')).toContainText('Gestión de Pacientes');

    // Verificar que la tabla de pacientes cargó registros
    const filas = page.locator('tbody tr');
    await expect(filas.first()).toBeVisible();

    // Filtrar por búsqueda
    await page.fill('#search', 'Perez');
    await page.waitForTimeout(500); // debounce
    await expect(page.locator('tbody')).toContainText('Perez');
  });

  test('debe visualizar el listado de agendas médicas y sus filtros', async ({ page }) => {
    await page.goto('/agendas');
    await expect(page.locator('h1')).toContainText('Configuración de Agendas Médicas');

    // Verificar que existe el selector de profesionales para filtrar
    const filtroProfesional = page.locator('#filtro-profesional');
    await expect(filtroProfesional).toBeVisible();

    // Verificar que las tarjetas o filas de agendas se visualizan
    await expect(page.locator('.card').first()).toBeVisible();
  });
});
