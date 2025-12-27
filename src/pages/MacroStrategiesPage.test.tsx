import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { MacroStrategiesPage } from './MacroStrategiesPage'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { createMacroStrategy, resetMacroStrategyIdCounter } from '@/test/factories'

describe('MacroStrategiesPage', () => {
  beforeEach(() => {
    resetMacroStrategyIdCounter()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Page Layout', () => {
    it('renders page title', async () => {
      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      expect(screen.getByRole('heading', { name: /macro strategies/i })).toBeInTheDocument()
    })

    it('renders back to dashboard link', async () => {
      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      const link = screen.getByRole('link', { name: /back to dashboard/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Filters', () => {
    it('renders date range filter', async () => {
      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    })

    it('renders bias filter', async () => {
      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      expect(screen.getByText('All Bias')).toBeInTheDocument()
    })
  })

  describe('Data Table', () => {
    it('displays loading state', async () => {
      server.use(
        http.get('/api/v1/macro_strategies', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({
            strategies: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('displays strategies in table', async () => {
      server.use(
        http.get('/api/v1/macro_strategies', () => {
          return HttpResponse.json({
            strategies: [
              createMacroStrategy({ id: 1, bias: 'bullish' }),
              createMacroStrategy({ id: 2, bias: 'bearish' }),
            ],
            meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
          })
        })
      )

      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      await waitFor(() => {
        expect(screen.getByText('bullish')).toBeInTheDocument()
      })

      expect(screen.getByText('bearish')).toBeInTheDocument()
    })

    it('displays empty state when no strategies', async () => {
      server.use(
        http.get('/api/v1/macro_strategies', () => {
          return HttpResponse.json({
            strategies: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      await waitFor(() => {
        expect(screen.getByText(/no strategies found/i)).toBeInTheDocument()
      })
    })

    it('expands row to show market narrative', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.get('/api/v1/macro_strategies', () => {
          return HttpResponse.json({
            strategies: [
              createMacroStrategy({
                id: 1,
                market_narrative: 'Bitcoin showing strong momentum with support at 95K'
              }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      const expandButton = screen.getByRole('button', { name: /expand row/i })
      await user.click(expandButton)

      expect(screen.getByText(/bitcoin showing strong momentum/i)).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls', async () => {
      server.use(
        http.get('/api/v1/macro_strategies', () => {
          return HttpResponse.json({
            strategies: Array.from({ length: 25 }, (_, i) => createMacroStrategy({ id: i + 1 })),
            meta: { page: 1, per_page: 25, total: 50, total_pages: 2 },
          })
        })
      )

      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      await waitFor(() => {
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      server.use(
        http.get('/api/v1/macro_strategies', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )

      render(<MacroStrategiesPage />, { initialEntries: ['/macro-strategies'] })

      await waitFor(() => {
        expect(screen.getByText(/error loading strategies/i)).toBeInTheDocument()
      })
    })
  })
})
