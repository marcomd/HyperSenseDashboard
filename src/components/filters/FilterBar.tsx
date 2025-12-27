import { X } from 'lucide-react'
import { DateRangeFilter } from './DateRangeFilter'
import { SymbolFilter } from './SymbolFilter'
import { StatusFilter } from './StatusFilter'
import { SearchFilter } from './SearchFilter'

export interface FilterState {
  startDate: string
  endDate: string
  symbol: string
  status: string
  search: string
}

interface StatusOption {
  value: string
  label: string
}

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  showDateRange?: boolean
  showSymbol?: boolean
  showStatus?: boolean
  showSearch?: boolean
  statusOptions?: StatusOption[]
  statusLabel?: string
  searchPlaceholder?: string
  symbols?: string[]
}

export function FilterBar({
  filters,
  onFiltersChange,
  showDateRange = false,
  showSymbol = false,
  showStatus = false,
  showSearch = false,
  statusOptions = [],
  statusLabel = 'Status',
  searchPlaceholder = 'Search...',
  symbols,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.symbol ||
    filters.status ||
    filters.search

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      symbol: '',
      status: '',
      search: '',
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-bg-secondary rounded-lg border border-slate-700">
      {showDateRange && (
        <DateRangeFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) => updateFilter('startDate', date)}
          onEndDateChange={(date) => updateFilter('endDate', date)}
        />
      )}

      {showSymbol && (
        <SymbolFilter
          value={filters.symbol}
          onChange={(value) => updateFilter('symbol', value)}
          symbols={symbols}
        />
      )}

      {showStatus && statusOptions.length > 0 && (
        <StatusFilter
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
          options={statusOptions}
          label={statusLabel}
        />
      )}

      {showSearch && (
        <SearchFilter
          value={filters.search}
          onChange={(value) => updateFilter('search', value)}
          placeholder={searchPlaceholder}
        />
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex items-center gap-1 px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded hover:border-red-400/50 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear all
        </button>
      )}
    </div>
  )
}
