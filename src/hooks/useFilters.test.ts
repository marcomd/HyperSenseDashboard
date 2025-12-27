import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilters, type FilterConfig } from './useFilters'
import { createTestWrapper } from '@/test/test-utils'

// Mock useSearchParams from react-router-dom
const mockSetSearchParams = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  }
})

describe('useFilters', () => {
  const defaultConfig: FilterConfig = {
    startDate: '',
    endDate: '',
    symbol: '',
    status: '',
    search: '',
    page: 1,
    pageSize: 25,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('startDate')
    mockSearchParams.delete('endDate')
    mockSearchParams.delete('symbol')
    mockSearchParams.delete('status')
    mockSearchParams.delete('search')
    mockSearchParams.delete('page')
    mockSearchParams.delete('pageSize')
  })

  describe('initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.filters).toEqual(defaultConfig)
    })

    it('reads initial values from URL params', () => {
      mockSearchParams.set('symbol', 'BTC')
      mockSearchParams.set('page', '2')

      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.filters.symbol).toBe('BTC')
      expect(result.current.filters.page).toBe(2)
    })
  })

  describe('setFilter', () => {
    it('updates single filter value', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('symbol', 'ETH')
      })

      expect(result.current.filters.symbol).toBe('ETH')
    })

    it('updates URL params when filter changes', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('symbol', 'BTC')
      })

      expect(mockSetSearchParams).toHaveBeenCalled()
    })

    it('resets page to 1 when non-page filter changes', () => {
      const configWithPage = { ...defaultConfig, page: 3 }
      const { result } = renderHook(() => useFilters(configWithPage), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('symbol', 'ETH')
      })

      expect(result.current.filters.page).toBe(1)
    })

    it('does not reset page when page filter changes', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('page', 5)
      })

      expect(result.current.filters.page).toBe(5)
    })
  })

  describe('setFilters', () => {
    it('updates multiple filters at once', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilters({
          symbol: 'BTC',
          status: 'executed',
        })
      })

      expect(result.current.filters.symbol).toBe('BTC')
      expect(result.current.filters.status).toBe('executed')
    })
  })

  describe('resetFilters', () => {
    it('resets all filters to defaults', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('symbol', 'BTC')
        result.current.setFilter('status', 'pending')
      })

      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual(defaultConfig)
    })

    it('clears URL params on reset', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('symbol', 'BTC')
      })

      act(() => {
        result.current.resetFilters()
      })

      expect(mockSetSearchParams).toHaveBeenLastCalledWith(expect.any(Function))
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('returns true when any filter has value', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('symbol', 'BTC')
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('ignores page and pageSize for hasActiveFilters', () => {
      const { result } = renderHook(() => useFilters(defaultConfig), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.setFilter('page', 5)
        result.current.setFilter('pageSize', 50)
      })

      expect(result.current.hasActiveFilters).toBe(false)
    })
  })
})
