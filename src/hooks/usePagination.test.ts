import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from './usePagination'

describe('usePagination', () => {
  describe('initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => usePagination())

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(25)
    })

    it('accepts initial page and pageSize', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 3, initialPageSize: 50 })
      )

      expect(result.current.page).toBe(3)
      expect(result.current.pageSize).toBe(50)
    })
  })

  describe('page navigation', () => {
    it('goes to next page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalPages: 5 })
      )

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(2)
    })

    it('goes to previous page', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 3 })
      )

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.page).toBe(2)
    })

    it('does not go below page 1', () => {
      const { result } = renderHook(() => usePagination())

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.page).toBe(1)
    })

    it('does not go above total pages', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 5, totalPages: 5 })
      )

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(5)
    })

    it('sets specific page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalPages: 10 })
      )

      act(() => {
        result.current.setPage(7)
      })

      expect(result.current.page).toBe(7)
    })
  })

  describe('page size', () => {
    it('changes page size', () => {
      const { result } = renderHook(() => usePagination())

      act(() => {
        result.current.setPageSize(50)
      })

      expect(result.current.pageSize).toBe(50)
    })

    it('resets to page 1 when page size changes', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 5 })
      )

      act(() => {
        result.current.setPageSize(50)
      })

      expect(result.current.page).toBe(1)
    })
  })

  describe('computed values', () => {
    it('calculates isFirstPage correctly', () => {
      const { result } = renderHook(() => usePagination({ totalPages: 5 }))

      expect(result.current.isFirstPage).toBe(true)

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.isFirstPage).toBe(false)
    })

    it('calculates isLastPage correctly', () => {
      const { result } = renderHook(() =>
        usePagination({ totalPages: 3 })
      )

      expect(result.current.isLastPage).toBe(false)

      act(() => {
        result.current.setPage(3)
      })

      expect(result.current.isLastPage).toBe(true)
    })

    it('calculates offset correctly', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 3, initialPageSize: 25 })
      )

      expect(result.current.offset).toBe(50) // (3 - 1) * 25
    })
  })

  describe('reset', () => {
    it('resets pagination to initial values', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 1, initialPageSize: 25 })
      )

      act(() => {
        result.current.setPage(5)
        result.current.setPageSize(100)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(25)
    })
  })
})
