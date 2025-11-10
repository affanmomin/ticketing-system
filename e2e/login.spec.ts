import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByText(/Sign in/i)).toBeVisible();
    
    await page.getByLabel(/Email/i).fill('admin@example.com');
    await page.getByLabel(/Password/i).fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/tickets/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel(/Email/i).fill('fail@example.com');
    await page.getByLabel(/Password/i).fill('wrong');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

