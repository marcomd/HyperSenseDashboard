import { useState } from 'react'
import { PageLayout, DataTable } from '@/components/common'
import {
  DateRangeFilter,
  SymbolFilter,
  StatusFilter,
  Pagination,
} from '@/components/filters'
import { useForecastsList } from '@/hooks/useApi'
import type { ForecastListItem } from '@/types'

const TIMEFRAME_OPTIONS = [
  { value: '1m', label: '1 Minute' },
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
]

export function ForecastsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [symbol, setSymbol] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, isError } = useForecastsList({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    symbol: symbol || undefined,
    timeframe: timeframe || undefined,
    page,
    per_page: pageSize,
  })

  const forecasts = data?.forecasts ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return 'text-green-400'
      case 'bearish':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-slate-400'
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (forecast: ForecastListItem) => (
        <span className="text-slate-400">#{forecast.id}</span>
      ),
    },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (forecast: ForecastListItem) => (
        <span className="font-medium">{forecast.symbol}</span>
      ),
    },
    {
      key: 'timeframe',
      header: 'Timeframe',
      render: (forecast: ForecastListItem) => (
        <span className="text-slate-300">{forecast.timeframe}</span>
      ),
    },
    {
      key: 'current_price',
      header: 'Current Price',
      render: (forecast: ForecastListItem) => (
        <span className="text-slate-300">${formatPrice(forecast.current_price)}</span>
      ),
    },
    {
      key: 'predicted_price',
      header: 'Predicted Price',
      render: (forecast: ForecastListItem) => (
        <span className="font-medium">${formatPrice(forecast.predicted_price)}</span>
      ),
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (forecast: ForecastListItem) => (
        <span className={`capitalize font-medium ${getDirectionColor(forecast.direction)}`}>
          {forecast.direction}
        </span>
      ),
    },
    {
      key: 'change_pct',
      header: 'Change %',
      render: (forecast: ForecastListItem) => (
        <span className={getChangeColor(forecast.change_pct)}>
          {forecast.change_pct > 0 ? '+' : ''}{forecast.change_pct.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (forecast: ForecastListItem) => (
        <span className="text-slate-400 text-sm">{formatDate(forecast.created_at)}</span>
      ),
    },
  ]

  if (isError) {
    return (
      <PageLayout title="Forecasts" subtitle="View and filter price forecast history">
        <div className="text-red-400 text-center py-8">Error loading forecasts</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Forecasts" subtitle="View and filter price forecast history">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <SymbolFilter value={symbol} onChange={setSymbol} />
          <StatusFilter
            label="Timeframe"
            options={TIMEFRAME_OPTIONS}
            value={timeframe}
            onChange={setTimeframe}
          />
        </div>

        <DataTable
          data={forecasts}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No forecasts found"
          keyExtractor={(forecast) => forecast.id}
        />

        {meta.total_pages > 0 && (
          <Pagination
            currentPage={page}
            totalPages={meta.total_pages}
            totalItems={meta.total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        )}
      </div>
    </PageLayout>
  )
}
