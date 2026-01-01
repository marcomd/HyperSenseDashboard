import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { DecisionsPage } from './DecisionsPage'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { createDecision, resetDecisionIdCounter } from '@/test/factories'

describe('DecisionsPage', () => {
  beforeEach(() => {
    resetDecisionIdCounter()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Page Layout', () => {
    it('renders page title', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByRole('heading', { name: /trading decisions/i })).toBeInTheDocument()
    })

    it('renders back to dashboard link', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      const link = screen.getByRole('link', { name: /back to dashboard/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Filters', () => {
    it('renders date range filter', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    })

    it('renders symbol filter', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByText('All Symbols')).toBeInTheDocument()
    })

    it('renders status filter', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByText('All Status')).toBeInTheDocument()
    })

    it('renders operation filter', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByText('All Operation')).toBeInTheDocument()
    })

    it('renders search filter', async () => {
      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('filters by symbol', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const fetchSpy = vi.fn()

      server.use(
        http.get('/api/v1/decisions', ({ request }) => {
          const url = new URL(request.url)
          fetchSpy(url.searchParams.get('symbol'))
          return HttpResponse.json({
            decisions: [createDecision({ symbol: 'ETH' })],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      // Find the symbol filter select by its "All Symbols" option
      const allSymbolsOption = screen.getByText('All Symbols')
      const symbolSelect = allSymbolsOption.closest('select')!
      await user.selectOptions(symbolSelect, 'ETH')

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('ETH')
      })
    })

    it('filters by status', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const fetchSpy = vi.fn()

      server.use(
        http.get('/api/v1/decisions', ({ request }) => {
          const url = new URL(request.url)
          fetchSpy(url.searchParams.get('status'))
          return HttpResponse.json({
            decisions: [createDecision({ status: 'executed' })],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      // Find the status filter select by its "All Status" option
      const allStatusOption = screen.getByText('All Status')
      const statusSelect = allStatusOption.closest('select')!
      await user.selectOptions(statusSelect, 'executed')

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('executed')
      })
    })
  })

  describe('Data Table', () => {
    it('displays loading state', async () => {
      server.use(
        http.get('/api/v1/decisions', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({
            decisions: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('displays decisions in table', async () => {
      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [
              createDecision({ id: 1, symbol: 'BTC', operation: 'open', status: 'executed' }),
              createDecision({ id: 2, symbol: 'ETH', operation: 'close', status: 'rejected' }),
            ],
            meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      // ETH appears in both filter dropdown and table, so use getAllByText
      const ethElements = screen.getAllByText('ETH')
      expect(ethElements.length).toBeGreaterThanOrEqual(2) // One in filter, one in table
      expect(screen.getByText('open')).toBeInTheDocument()
      expect(screen.getByText('close')).toBeInTheDocument()
    })

    it('displays volatility column', async () => {
      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [
              createDecision({
                id: 1,
                symbol: 'BTC',
                volatility_level: 'high',
              }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      // Check the Volatility column header
      expect(screen.getByRole('columnheader', { name: 'Volatility' })).toBeInTheDocument()
      // ATR and Next Cycle columns have been moved to expanded section
      expect(screen.queryByRole('columnheader', { name: 'ATR' })).not.toBeInTheDocument()
      expect(screen.queryByRole('columnheader', { name: 'Next Cycle' })).not.toBeInTheDocument()
    })

    it('displays ATR in expanded section', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [
              createDecision({
                id: 1,
                symbol: 'BTC',
                atr_value: 0.025,
              }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      // Expand row to see ATR
      const expandButton = screen.getByRole('button', { name: /expand row/i })
      await user.click(expandButton)

      // ATR should appear in expanded section
      expect(screen.getByText('ATR Value')).toBeInTheDocument()
      expect(screen.getByText('2.50%')).toBeInTheDocument()
    })

    it('displays llm_model in expanded section', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [
              createDecision({ id: 1, symbol: 'BTC', llm_model: 'claude-sonnet-4-5' }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      // Model should NOT be in table columns (moved to expanded section)
      expect(screen.queryByRole('columnheader', { name: 'Model' })).not.toBeInTheDocument()

      // Expand row to see Model
      const expandButton = screen.getByRole('button', { name: /expand row/i })
      await user.click(expandButton)

      // Model should appear in expanded section
      expect(screen.getByText('claude-sonnet-4-5')).toBeInTheDocument()
    })

    it('displays empty state when no decisions', async () => {
      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [],
            meta: { page: 1, per_page: 25, total: 0, total_pages: 0 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText(/no decisions found/i)).toBeInTheDocument()
      })
    })

    it('expands row to show reasoning', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [
              createDecision({
                id: 1,
                symbol: 'BTC',
                reasoning: 'Strong bullish momentum with RSI above 50'
              }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument()
      })

      const expandButton = screen.getByRole('button', { name: /expand row/i })
      await user.click(expandButton)

      expect(screen.getByText(/strong bullish momentum/i)).toBeInTheDocument()
    })

    it('shows rejection reason for rejected decisions', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: [
              createDecision({
                id: 1,
                status: 'rejected',
                rejection_reason: 'Risk limit exceeded'
              }),
            ],
            meta: { page: 1, per_page: 25, total: 1, total_pages: 1 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      const expandButton = screen.getByRole('button', { name: /expand row/i })
      await user.click(expandButton)

      expect(screen.getByText(/risk limit exceeded/i)).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls', async () => {
      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({
            decisions: Array.from({ length: 25 }, (_, i) => createDecision({ id: i + 1 })),
            meta: { page: 1, per_page: 25, total: 50, total_pages: 2 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
      })
    })

    it('navigates to next page', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const fetchSpy = vi.fn()

      server.use(
        http.get('/api/v1/decisions', ({ request }) => {
          const url = new URL(request.url)
          const page = url.searchParams.get('page') || '1'
          fetchSpy(page)
          return HttpResponse.json({
            decisions: Array.from({ length: 25 }, (_, i) =>
              createDecision({ id: (Number(page) - 1) * 25 + i + 1 })
            ),
            meta: { page: Number(page), per_page: 25, total: 50, total_pages: 2 },
          })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
      })

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('2')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      server.use(
        http.get('/api/v1/decisions', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )

      render(<DecisionsPage />, { initialEntries: ['/decisions'] })

      await waitFor(() => {
        expect(screen.getByText(/error loading decisions/i)).toBeInTheDocument()
      })
    })
  })
})
