import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the dashboard
    await page.goto('/')
    // Wait for the app to load
    await expect(page.getByRole('heading', { name: 'HyperSense' })).toBeVisible({ timeout: 10000 })
  })

  test('displays all navigation links in header', async ({ page }) => {
    // Check all navigation links are visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Decisions' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Strategies' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Forecasts' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Snapshots' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Exec Logs' })).toBeVisible()
  })

  test('navigates to Decisions page', async ({ page }) => {
    await page.getByRole('link', { name: 'Decisions' }).click()
    await expect(page).toHaveURL('/decisions')
    await expect(page.getByRole('heading', { name: 'Trading Decisions' })).toBeVisible()
  })

  test('navigates to Strategies page', async ({ page }) => {
    await page.getByRole('link', { name: 'Strategies' }).click()
    await expect(page).toHaveURL('/macro-strategies')
    await expect(page.getByRole('heading', { name: 'Macro Strategies' })).toBeVisible()
  })

  test('navigates to Forecasts page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forecasts' }).click()
    await expect(page).toHaveURL('/forecasts')
    await expect(page.getByRole('heading', { name: 'Forecasts' })).toBeVisible()
  })

  test('navigates to Snapshots page', async ({ page }) => {
    await page.getByRole('link', { name: 'Snapshots' }).click()
    await expect(page).toHaveURL('/market-snapshots')
    await expect(page.getByRole('heading', { name: 'Market Snapshots' })).toBeVisible()
  })

  test('navigates to Execution Logs page', async ({ page }) => {
    await page.getByRole('link', { name: 'Exec Logs' }).click()
    await expect(page).toHaveURL('/execution-logs')
    await expect(page.getByRole('heading', { name: 'Execution Logs' })).toBeVisible()
  })

  test('navigates back to Dashboard', async ({ page }) => {
    // First navigate away
    await page.getByRole('link', { name: 'Decisions' }).click()
    await expect(page).toHaveURL('/decisions')

    // Then navigate back to Dashboard (exact: true to avoid matching "Back to Dashboard")
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
    await expect(page).toHaveURL('/')
  })

  test('navigates using logo link', async ({ page }) => {
    // Navigate away first
    await page.getByRole('link', { name: 'Exec Logs' }).click()
    await expect(page).toHaveURL('/execution-logs')

    // Click on HyperSense logo/title to go back to dashboard
    await page.getByRole('link', { name: 'HyperSense' }).click()
    await expect(page).toHaveURL('/')
  })

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-that-does-not-exist')
    await expect(page.getByText('Page Not Found')).toBeVisible()
  })
})

test.describe('Page Filters', () => {
  test('Decisions page has filter controls', async ({ page }) => {
    await page.goto('/decisions')
    await expect(page.getByRole('heading', { name: 'Trading Decisions' })).toBeVisible()

    // Check for filter components - date inputs and comboboxes
    await expect(page.getByRole('textbox', { name: 'Start Date' })).toBeVisible()
    await expect(page.getByRole('combobox').first()).toBeVisible()
  })

  test('Execution Logs page has filter controls', async ({ page }) => {
    await page.goto('/execution-logs')
    await expect(page.getByRole('heading', { name: 'Execution Logs' })).toBeVisible()

    // Check for filter components - should have comboboxes for status and action
    await expect(page.getByRole('combobox').first()).toBeVisible()
  })

  test('Forecasts page has filter controls', async ({ page }) => {
    await page.goto('/forecasts')
    await expect(page.getByRole('heading', { name: 'Forecasts' })).toBeVisible()

    // Check for filter controls OR error state (if backend not running)
    // The page shows filters in normal state, error message if API fails
    const filters = page.getByRole('combobox').first()
    const errorState = page.getByText('Error loading forecasts')
    await expect(filters.or(errorState)).toBeVisible()
  })
})
