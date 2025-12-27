import { Calendar, X } from 'lucide-react'

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const applyPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    onStartDateChange(formatDate(start))
    onEndDateChange(formatDate(end))
  }

  const handleReset = () => {
    onStartDateChange('')
    onEndDateChange('')
  }

  const hasDateSet = startDate || endDate

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="start-date">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-bg-tertiary border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
            aria-label="Start Date"
          />
          <span className="text-slate-400">to</span>
          <label className="sr-only" htmlFor="end-date">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-bg-tertiary border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
            aria-label="End Date"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => applyPreset(1)}
          className="px-2 py-1 text-xs bg-bg-tertiary text-slate-300 rounded hover:bg-slate-600 transition-colors"
        >
          24h
        </button>
        <button
          type="button"
          onClick={() => applyPreset(7)}
          className="px-2 py-1 text-xs bg-bg-tertiary text-slate-300 rounded hover:bg-slate-600 transition-colors"
        >
          7d
        </button>
        <button
          type="button"
          onClick={() => applyPreset(30)}
          className="px-2 py-1 text-xs bg-bg-tertiary text-slate-300 rounded hover:bg-slate-600 transition-colors"
        >
          30d
        </button>
      </div>

      {hasDateSet && (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="w-3 h-3" />
          Reset
        </button>
      )}
    </div>
  )
}
