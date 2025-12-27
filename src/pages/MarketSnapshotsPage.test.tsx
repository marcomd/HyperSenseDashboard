import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { MarketSnapshotsPage } from './MarketSnapshotsPage'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { createMarketSnapshot, resetMarketSnapshotIdCounter } from '@/test/factories'

describe('MarketSnapshotsPage', () => {
  beforeEach(() => {
    resetMarketSnapshotIdCounter()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Page Layout', () => {
    it('renders page title', async () => {
      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      expect(screen.getByRole('heading', { name: /market snapshots/i })).toBeInTheDocument()
    })

    it('renders back to dashboard link', async () => {
      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      const link = screen.getByRole('link', { name: /back to dashboard/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Filters', () => {
    it('renders date range filter', async () => {
      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    })

    it('renders symbol filter', async () => {
      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      expect(screen.getByText('All Symbols')).toBeInTheDocument()
    })
  })

  describe('Data Table', () => {
    it('displays loading state', async () => {
      server.use(
        http.get('/api/v1/market_data/snapshots', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({
            snapshots: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('displays snapshots in table', async () => {
      server.use(
        http.get('/api/v1/market_data/snapshots', () => {
          return HttpResponse.json({
            snapshots: [
              createMarketSnapshot({ id: 1, symbol: 'BTC', price: 98500 }),
              createMarketSnapshot({ id: 2, symbol: 'ETH', price: 3450 }),
            ],
            meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
          })
        })
      )

      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      // ETH appears in both filter dropdown and table
      const ethElements = screen.getAllByText('ETH')
      expect(ethElements.length).toBeGreaterThanOrEqual(2)
    })

    it('displays empty state when no snapshots', async () => {
      server.use(
        http.get('/api/v1/market_data/snapshots', () => {
          return HttpResponse.json({
            snapshots: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      await waitFor(() => {
        expect(screen.getByText(/no snapshots found/i)).toBeInTheDocument()
      })
    })

    it('expands row to show indicators', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.get('/api/v1/market_data/snapshots', () => {
          return HttpResponse.json({
            snapshots: [
              createMarketSnapshot({
                id: 1,
                symbol: 'BTC',
                indicators: {
                  rsi_14: 55.5,
                  ema_20: 97500,
                  ema_50: 96500,
                  ema_100: 95500,
                  macd: { value: 50, signal: 45, histogram: 5 },
                },
              }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      const expandButton = screen.getByRole('button', { name: /expand row/i })
      await user.click(expandButton)

      expect(screen.getByText(/rsi_14/i)).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls', async () => {
      server.use(
        http.get('/api/v1/market_data/snapshots', () => {
          return HttpResponse.json({
            snapshots: Array.from({ length: 25 }, (_, i) => createMarketSnapshot({ id: i + 1 })),
            meta: { page: 1, per_page: 25, total: 50, total_pages: 2 },
          })
        })
      )

      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      await waitFor(() => {
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      server.use(
        http.get('/api/v1/market_data/snapshots', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )

      render(<MarketSnapshotsPage />, { initialEntries: ['/market-snapshots'] })

      await waitFor(() => {
        expect(screen.getByText(/error loading snapshots/i)).toBeInTheDocument()
      })
    })
  })
})
