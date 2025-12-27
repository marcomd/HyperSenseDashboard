import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  totalPages?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 25,
    totalPages = 1,
  } = options

  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const setPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPageState(newPage)
      }
    },
    [totalPages]
  )

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize)
    setPageState(1) // Reset to first page when page size changes
  }, [])

  const nextPage = useCallback(() => {
    setPageState((current) => {
      if (current < totalPages) {
        return current + 1
      }
      return current
    })
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPageState((current) => {
      if (current > 1) {
        return current - 1
      }
      return current
    })
  }, [])

  const reset = useCallback(() => {
    setPageState(initialPage)
    setPageSizeState(initialPageSize)
  }, [initialPage, initialPageSize])

  const isFirstPage = page === 1
  const isLastPage = page >= totalPages

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    reset,
    isFirstPage,
    isLastPage,
    offset,
  }
}
