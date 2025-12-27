import { useState } from 'react'
import { PageLayout, DataTable } from '@/components/common'
import {
  DateRangeFilter,
  StatusFilter,
  Pagination,
} from '@/components/filters'
import { useMacroStrategiesList } from '@/hooks/useApi'
import type { MacroStrategy } from '@/types'

const BIAS_OPTIONS = [
  { value: 'bullish', label: 'Bullish' },
  { value: 'bearish', label: 'Bearish' },
  { value: 'neutral', label: 'Neutral' },
]

export function MacroStrategiesPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bias, setBias] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, isError } = useMacroStrategiesList({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: bias || undefined,
    page,
    per_page: pageSize,
  })

  const strategies = data?.strategies ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'bullish':
        return 'text-green-400'
      case 'bearish':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (strategy: MacroStrategy) => (
        <span className="text-slate-400">#{strategy.id}</span>
      ),
    },
    {
      key: 'bias',
      header: 'Bias',
      render: (strategy: MacroStrategy) => (
        <span className={`capitalize font-medium ${getBiasColor(strategy.bias)}`}>
          {strategy.bias}
        </span>
      ),
    },
    {
      key: 'risk_tolerance',
      header: 'Risk Tolerance',
      render: (strategy: MacroStrategy) => (
        <span className="capitalize">{strategy.risk_tolerance}</span>
      ),
    },
    {
      key: 'valid_until',
      header: 'Valid Until',
      render: (strategy: MacroStrategy) => (
        <span className="text-slate-400 text-sm">{formatDate(strategy.valid_until)}</span>
      ),
    },
    {
      key: 'stale',
      header: 'Status',
      render: (strategy: MacroStrategy) => (
        <span className={strategy.stale ? 'text-red-400' : 'text-green-400'}>
          {strategy.stale ? 'Stale' : 'Active'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (strategy: MacroStrategy) => (
        <span className="text-slate-400 text-sm">{formatDate(strategy.created_at)}</span>
      ),
    },
  ]

  const renderExpanded = (strategy: MacroStrategy) => (
    <div className="grid gap-4">
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-1">Market Narrative</h4>
        <p className="text-sm text-slate-300">{strategy.market_narrative}</p>
      </div>
      {strategy.key_levels && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Key Levels</h4>
          <pre className="text-sm text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(strategy.key_levels, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )

  if (isError) {
    return (
      <PageLayout title="Macro Strategies" subtitle="View and filter macro strategy history">
        <div className="text-red-400 text-center py-8">Error loading strategies</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Macro Strategies" subtitle="View and filter macro strategy history">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <StatusFilter
            label="Bias"
            options={BIAS_OPTIONS}
            value={bias}
            onChange={setBias}
          />
        </div>

        <DataTable
          data={strategies}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No strategies found"
          renderExpanded={renderExpanded}
          keyExtractor={(strategy) => strategy.id}
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
