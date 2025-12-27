import { useState } from 'react'
import { PageLayout, DataTable } from '@/components/common'
import {
  DateRangeFilter,
  SymbolFilter,
  Pagination,
} from '@/components/filters'
import { useMarketSnapshotsList } from '@/hooks/useApi'
import type { MarketSnapshot } from '@/types'

export function MarketSnapshotsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [symbol, setSymbol] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, isError } = useMarketSnapshotsList({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    symbol: symbol || undefined,
    page,
    per_page: pageSize,
  })

  const snapshots = data?.snapshots ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getRsiSignal = (rsi: number | null) => {
    if (rsi === null) return { text: '-', color: 'text-slate-400' }
    if (rsi >= 70) return { text: 'Overbought', color: 'text-red-400' }
    if (rsi <= 30) return { text: 'Oversold', color: 'text-green-400' }
    return { text: 'Neutral', color: 'text-yellow-400' }
  }

  const getMacdSignal = (macd: { value: number; signal: number } | undefined) => {
    if (!macd) return { text: '-', color: 'text-slate-400' }
    if (macd.value > macd.signal) return { text: 'Bullish', color: 'text-green-400' }
    if (macd.value < macd.signal) return { text: 'Bearish', color: 'text-red-400' }
    return { text: 'Neutral', color: 'text-yellow-400' }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (snapshot: MarketSnapshot) => (
        <span className="text-slate-400">#{snapshot.id}</span>
      ),
    },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (snapshot: MarketSnapshot) => (
        <span className="font-medium">{snapshot.symbol}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (snapshot: MarketSnapshot) => (
        <span className="text-slate-300">${formatPrice(snapshot.price)}</span>
      ),
    },
    {
      key: 'rsi_14',
      header: 'RSI (14)',
      render: (snapshot: MarketSnapshot) => {
        const rsi = snapshot.indicators?.rsi_14
        return (
          <span className="text-slate-300">
            {rsi !== null && rsi !== undefined ? rsi.toFixed(1) : '-'}
          </span>
        )
      },
    },
    {
      key: 'rsi_signal',
      header: 'RSI Signal',
      render: (snapshot: MarketSnapshot) => {
        const signal = getRsiSignal(snapshot.indicators?.rsi_14 ?? null)
        return <span className={signal.color}>{signal.text}</span>
      },
    },
    {
      key: 'macd_signal',
      header: 'MACD Signal',
      render: (snapshot: MarketSnapshot) => {
        const signal = getMacdSignal(snapshot.indicators?.macd)
        return <span className={signal.color}>{signal.text}</span>
      },
    },
    {
      key: 'captured_at',
      header: 'Captured',
      render: (snapshot: MarketSnapshot) => (
        <span className="text-slate-400 text-sm">{formatDate(snapshot.captured_at)}</span>
      ),
    },
  ]

  const renderExpanded = (snapshot: MarketSnapshot) => (
    <div className="grid gap-4">
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-1">Indicators</h4>
        <pre className="text-sm text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
          {JSON.stringify(snapshot.indicators, null, 2)}
        </pre>
      </div>
      {snapshot.sentiment && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Sentiment</h4>
          <pre className="text-sm text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(snapshot.sentiment, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )

  if (isError) {
    return (
      <PageLayout title="Market Snapshots" subtitle="View and filter market snapshot history">
        <div className="text-red-400 text-center py-8">Error loading snapshots</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Market Snapshots" subtitle="View and filter market snapshot history">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <SymbolFilter value={symbol} onChange={setSymbol} />
        </div>

        <DataTable
          data={snapshots}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No snapshots found"
          renderExpanded={renderExpanded}
          keyExtractor={(snapshot) => snapshot.id}
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
