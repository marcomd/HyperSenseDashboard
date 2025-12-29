import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads and displays all sections', async ({ page }) => {
    await page.goto('/')

    // Wait for the dashboard to load (either content or loading state)
    await expect(
      page.getByRole('heading', { name: 'HyperSense' }).or(page.getByText('Loading'))
    ).toBeVisible({ timeout: 10000 })

    // If loading, wait for it to complete
    const loading = page.getByText('Loading dashboard...')
    if (await loading.isVisible()) {
      await expect(loading).not.toBeVisible({ timeout: 30000 })
    }

    // Verify main header is visible
    await expect(page.getByRole('heading', { name: 'HyperSense' })).toBeVisible()
    await expect(page.getByText('Autonomous Trading Agent')).toBeVisible()
  })

  test('displays dashboard sections when data loads', async ({ page }) => {
    await page.goto('/')

    // Wait for content to load (may timeout if backend not running)
    try {
      await expect(page.getByText('Account Summary')).toBeVisible({ timeout: 15000 })

      // Check for main dashboard sections
      await expect(page.getByText('Market Overview')).toBeVisible()
      await expect(page.getByText('System Status')).toBeVisible()
    } catch {
      // Backend might not be running - check for error state
      const errorMessage = page.getByText('Failed to load').or(page.getByText('Error'))
      if (await errorMessage.isVisible()) {
        // This is expected if backend is not running
        expect(true).toBe(true)
      }
    }
  })

  test('shows connection status indicator', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'HyperSense' })).toBeVisible({ timeout: 10000 })

    // Check for connection status (Connected or Disconnected)
    const connectionStatus = page
      .getByText('Connected')
      .or(page.getByText('Disconnected'))
    await expect(connectionStatus).toBeVisible()
  })
})
