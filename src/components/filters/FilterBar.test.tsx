import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'
import { FilterBar } from './FilterBar'

describe('FilterBar', () => {
  const defaultFilters = {
    startDate: '',
    endDate: '',
    symbol: '',
    status: '',
    search: '',
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'executed', label: 'Executed' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders date range filter when enabled', () => {
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          showDateRange
        />
      )
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    })

    it('renders symbol filter when enabled', () => {
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          showSymbol
        />
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders status filter when enabled with options', () => {
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          showStatus
          statusOptions={statusOptions}
          statusLabel="Status"
        />
      )
      expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument()
    })

    it('renders search filter when enabled', () => {
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          showSearch
        />
      )
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('hides disabled filters', () => {
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          showDateRange={false}
          showSymbol={false}
        />
      )
      expect(screen.queryByLabelText('Start Date')).not.toBeInTheDocument()
    })
  })

  describe('filter changes', () => {
    it('calls onFiltersChange when date changes', () => {
      const onFiltersChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
          showDateRange
        />
      )

      fireEvent.change(screen.getByLabelText('Start Date'), {
        target: { value: '2024-01-01' },
      })

      expect(onFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        startDate: '2024-01-01',
      })
    })

    it('calls onFiltersChange when symbol changes', () => {
      const onFiltersChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
          showSymbol
        />
      )

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'BTC' },
      })

      expect(onFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        symbol: 'BTC',
      })
    })

    it('calls onFiltersChange when search changes (debounced)', () => {
      const onFiltersChange = vi.fn()
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={onFiltersChange}
          showSearch
        />
      )

      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'test' },
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: 'test',
      })
    })
  })

  describe('clear all', () => {
    it('shows clear all button when any filter has value', () => {
      render(
        <FilterBar
          filters={{ ...defaultFilters, symbol: 'BTC' }}
          onFiltersChange={vi.fn()}
          showSymbol
        />
      )
      expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
    })

    it('hides clear all button when no filters have value', () => {
      render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          showSymbol
        />
      )
      expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
    })

    it('resets all filters when clear all is clicked', () => {
      const onFiltersChange = vi.fn()
      render(
        <FilterBar
          filters={{ ...defaultFilters, symbol: 'BTC', startDate: '2024-01-01' }}
          onFiltersChange={onFiltersChange}
          showSymbol
          showDateRange
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))

      expect(onFiltersChange).toHaveBeenCalledWith({
        startDate: '',
        endDate: '',
        symbol: '',
        status: '',
        search: '',
      })
    })
  })
})
