import { test, expect } from '@playwright/test';

test.describe('Módulo de Reportes e Indicadores de Gestión', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como Administrador
    await page.goto('/login');
    await page.fill('#dni', '11111111');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('debe cargar la vista de reportes con filtros y botón de exportación CSV', async ({ page }) => {
    await page.goto('/reportes');
    await expect(page.locator('h1')).toContainText('Reportes e Indicadores de Gestión');

    // Botones de filtro rápido de período y accesos directos
    await expect(page.locator('button:has-text("Hoy")')).toBeVisible();
    await expect(page.locator('button:has-text("Última semana")')).toBeVisible();
    await expect(page.locator('button:has-text("Este mes")')).toBeVisible();
    await expect(page.locator('button:has-text("Mes anterior")')).toBeVisible();
    await expect(page.locator('button:has-text("Últimos 30 días")')).toBeVisible();

    // Botón Cerrar Sesión en navbar superior
    await expect(page.locator('nav button:has-text("Cerrar Sesión")')).toBeVisible();

    // Botón de exportar a CSV
    const exportBtn = page.locator('button:has-text("Exportar a CSV")');
    await expect(exportBtn).toBeVisible();

    // Selector de especialidad en filtros
    await expect(page.locator('#filtro-especialidad, select').first()).toBeVisible();
  });

  test('debe permitir cerrar sesión directamente desde la pantalla de reportes', async ({ page }) => {
    await page.goto('/reportes');
    await page.click('nav button:has-text("Cerrar Sesión")');
    const modalConfirmBtn = page.locator('.modal-footer button.btn-danger');
    await modalConfirmBtn.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('debe restringir el acceso a reportes si el usuario no es ADMIN', async ({ page }) => {
    // Cerrar sesión y acceder como paciente
    await page.goto('/dashboard');
    await page.click('button:has-text("Cerrar Sesión")');
    const modalConfirmBtn = page.locator('.modal-footer button.btn-danger');
    await modalConfirmBtn.click();

    // Login Paciente
    await page.fill('#dni', '22222222');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Intentar navegar directo a /reportes
    await page.goto('/reportes');
    // Debe redirigir al dashboard por roleGuard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
