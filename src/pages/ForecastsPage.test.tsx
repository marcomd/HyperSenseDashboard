import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { ForecastsPage } from './ForecastsPage'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { createForecastListItem, resetForecastIdCounter } from '@/test/factories'

describe('ForecastsPage', () => {
  beforeEach(() => {
    resetForecastIdCounter()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Page Layout', () => {
    it('renders page title', async () => {
      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      expect(screen.getByRole('heading', { name: /forecasts/i })).toBeInTheDocument()
    })

    it('renders back to dashboard link', async () => {
      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      const link = screen.getByRole('link', { name: /back to dashboard/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Filters', () => {
    it('renders date range filter', async () => {
      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    })

    it('renders symbol filter', async () => {
      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      expect(screen.getByText('All Symbols')).toBeInTheDocument()
    })

    it('renders timeframe filter', async () => {
      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      expect(screen.getByText('All Timeframe')).toBeInTheDocument()
    })
  })

  describe('Data Table', () => {
    it('displays loading state', async () => {
      server.use(
        http.get('/api/v1/market_data/forecasts', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({
            forecasts: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('displays forecasts in table', async () => {
      server.use(
        http.get('/api/v1/market_data/forecasts', () => {
          return HttpResponse.json({
            forecasts: [
              createForecastListItem({ id: 1, symbol: 'BTC', timeframe: '1h', direction: 'bullish' }),
              createForecastListItem({ id: 2, symbol: 'ETH', timeframe: '15m', direction: 'bearish' }),
            ],
            meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
          })
        })
      )

      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      // ETH appears in both filter dropdown and table
      const ethElements = screen.getAllByText('ETH')
      expect(ethElements.length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('1h')).toBeInTheDocument()
      expect(screen.getByText('15m')).toBeInTheDocument()
    })

    it('displays empty state when no forecasts', async () => {
      server.use(
        http.get('/api/v1/market_data/forecasts', () => {
          return HttpResponse.json({
            forecasts: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      await waitFor(() => {
        expect(screen.getByText(/no forecasts found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls', async () => {
      server.use(
        http.get('/api/v1/market_data/forecasts', () => {
          return HttpResponse.json({
            forecasts: Array.from({ length: 25 }, (_, i) => createForecastListItem({ id: i + 1 })),
            meta: { page: 1, per_page: 25, total: 50, total_pages: 2 },
          })
        })
      )

      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      await waitFor(() => {
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      server.use(
        http.get('/api/v1/market_data/forecasts', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )

      render(<ForecastsPage />, { initialEntries: ['/forecasts'] })

      await waitFor(() => {
        expect(screen.getByText(/error loading forecasts/i)).toBeInTheDocument()
      })
    })
  })
})
