import { test, expect } from '@playwright/test';

test.describe('Autenticación y Control de Acceso', () => {
  test('debe denegar acceso con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#dni', '99999999');
    await page.fill('#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    const alert = page.locator('.alert-danger');
    await expect(alert).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });

  test('debe iniciar sesión exitosamente como Administrador', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#dni', '11111111');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Bienvenido');
    await expect(page.locator('.badge')).toContainText('ADMIN');
  });

  test('debe iniciar sesión como Paciente y poder cerrar sesión', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#dni', '22222222');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('.badge')).toContainText('PACIENTE');

    // Cerrar sesión
    await page.click('button:has-text("Cerrar Sesión")');
    const modalConfirmBtn = page.locator('.modal-footer button.btn-danger');
    await expect(modalConfirmBtn).toBeVisible();
    await modalConfirmBtn.click();

    await expect(page).toHaveURL(/.*login/);
  });

  test('debe redirigir al login si se accede a una ruta protegida sin autenticación', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
});
