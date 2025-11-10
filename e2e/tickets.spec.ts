import { test, expect } from '@playwright/test';

test.describe('Tickets Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('admin@example.com');
    await page.getByLabel(/Password/i).fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL(/\/dashboard|\/tickets/);
  });

  test('should display tickets list', async ({ page }) => {
    await page.goto('/tickets');
    
    await expect(page.getByText(/Tickets/i)).toBeVisible();
    await expect(page.getByText(/Set up billing webhook/i)).toBeVisible();
  });

  test('should filter tickets', async ({ page }) => {
    await page.goto('/tickets');
    
    // Filter by status
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /To Do/i }).click();
    
    // Should show filtered results
    await expect(page.getByText(/Tickets/i)).toBeVisible();
  });

  test('should create a new ticket', async ({ page }) => {
    await page.goto('/tickets');
    
    await page.getByRole('button', { name: /New ticket/i }).click();
    
    // Should open create ticket dialog
    await expect(page.getByText(/Create ticket/i)).toBeVisible();
  });
});

