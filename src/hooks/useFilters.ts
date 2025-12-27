import { useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface FilterConfig {
  startDate: string
  endDate: string
  symbol: string
  status: string
  search: string
  page: number
  pageSize: number
}

type FilterKey = keyof FilterConfig

export function useFilters(defaults: FilterConfig) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize filters from URL params or defaults
  const getInitialFilters = useCallback((): FilterConfig => {
    return {
      startDate: searchParams.get('startDate') || defaults.startDate,
      endDate: searchParams.get('endDate') || defaults.endDate,
      symbol: searchParams.get('symbol') || defaults.symbol,
      status: searchParams.get('status') || defaults.status,
      search: searchParams.get('search') || defaults.search,
      page: Number(searchParams.get('page')) || defaults.page,
      pageSize: Number(searchParams.get('pageSize')) || defaults.pageSize,
    }
  }, [searchParams, defaults])

  const [filters, setFiltersState] = useState<FilterConfig>(getInitialFilters)

  // Update URL params
  const updateUrlParams = useCallback(
    (newFilters: FilterConfig) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)

        // Update each filter param
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value && value !== defaults[key as FilterKey]) {
            params.set(key, String(value))
          } else {
            params.delete(key)
          }
        })

        return params
      })
    },
    [setSearchParams, defaults]
  )

  // Set a single filter
  const setFilter = useCallback(
    <K extends FilterKey>(key: K, value: FilterConfig[K]) => {
      setFiltersState((prev) => {
        const newFilters = { ...prev, [key]: value }
        // Reset page to 1 when changing non-page filters
        if (key !== 'page' && key !== 'pageSize') {
          newFilters.page = 1
        }
        updateUrlParams(newFilters)
        return newFilters
      })
    },
    [updateUrlParams]
  )

  // Set multiple filters at once
  const setFilters = useCallback(
    (updates: Partial<FilterConfig>) => {
      setFiltersState((prev) => {
        const newFilters = { ...prev, ...updates }
        // Reset page to 1 if any non-page filter is updated
        const hasNonPageUpdate = Object.keys(updates).some(
          (key) => key !== 'page' && key !== 'pageSize'
        )
        if (hasNonPageUpdate) {
          newFilters.page = 1
        }
        updateUrlParams(newFilters)
        return newFilters
      })
    },
    [updateUrlParams]
  )

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    setFiltersState(defaults)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      // Clear all filter params
      ;['startDate', 'endDate', 'symbol', 'status', 'search', 'page', 'pageSize'].forEach(
        (key) => params.delete(key)
      )
      return params
    })
  }, [defaults, setSearchParams])

  // Check if any filter (excluding pagination) has a value
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.startDate ||
        filters.endDate ||
        filters.symbol ||
        filters.status ||
        filters.search
    )
  }, [filters])

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  }
}
