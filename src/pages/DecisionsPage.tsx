import { useState } from 'react'
import { PageLayout, DataTable, VolatilityBadge } from '@/components/common'
import {
  DateRangeFilter,
  SymbolFilter,
  StatusFilter,
  SearchFilter,
  Pagination,
} from '@/components/filters'
import { PositionPnLDisplay } from '@/components/cards/DecisionLog'
import { useDecisionsList } from '@/hooks/useApi'
import type { TradingDecision } from '@/types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'executed', label: 'Executed' },
  { value: 'failed', label: 'Failed' },
]

const OPERATION_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'close', label: 'Close' },
  { value: 'hold', label: 'Hold' },
]

const VOLATILITY_OPTIONS = [
  { value: 'very_high', label: 'Very High' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function DecisionsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [symbol, setSymbol] = useState('')
  const [status, setStatus] = useState('')
  const [operation, setOperation] = useState('')
  const [volatilityLevel, setVolatilityLevel] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, isError } = useDecisionsList({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    symbol: symbol || undefined,
    status: status || undefined,
    operation: operation || undefined,
    volatility_level: volatilityLevel || undefined,
    search: search || undefined,
    page,
    per_page: pageSize,
  })

  const decisions = data?.decisions ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'text-green-400'
      case 'rejected':
      case 'failed':
        return 'text-red-400'
      case 'pending':
        return 'text-yellow-400'
      case 'approved':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  const getDirectionColor = (direction: string | null) => {
    if (!direction) return 'text-slate-400'
    return direction === 'long' ? 'text-green-400' : 'text-red-400'
  }

  const getProfileColor = (profile: string | null) => {
    switch (profile) {
      case 'cautious':
        return 'text-blue-400 bg-blue-500/20'
      case 'fearless':
        return 'text-orange-400 bg-orange-500/20'
      default:
        return 'text-slate-400 bg-slate-700/50'
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (decision: TradingDecision) => (
        <span className="text-slate-400">#{decision.id}</span>
      ),
    },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (decision: TradingDecision) => (
        <span className="font-medium">{decision.symbol}</span>
      ),
    },
    {
      key: 'operation',
      header: 'Operation',
      render: (decision: TradingDecision) => (
        <span className="capitalize">{decision.operation}</span>
      ),
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (decision: TradingDecision) => (
        <span className={`capitalize ${getDirectionColor(decision.direction)}`}>
          {decision.direction}
        </span>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (decision: TradingDecision) => (
        <span>{decision.confidence !== null ? `${(decision.confidence * 100).toFixed(0)}%` : '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (decision: TradingDecision) => (
        <span className={`capitalize ${getStatusColor(decision.status)}`}>
          {decision.status}
        </span>
      ),
    },
    {
      key: 'volatility_level',
      header: 'Volatility',
      render: (decision: TradingDecision) => (
        <VolatilityBadge level={decision.volatility_level} />
      ),
    },
    {
      key: 'risk_profile_name',
      header: 'Profile',
      render: (decision: TradingDecision) => (
        <span className={`text-xs px-2 py-0.5 rounded capitalize ${getProfileColor(decision.risk_profile_name)}`}>
          {decision.risk_profile_name ?? '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (decision: TradingDecision) => (
        <span className="text-slate-400 text-sm">{formatDate(decision.created_at)}</span>
      ),
    },
  ]

  const renderExpanded = (decision: TradingDecision) => (
    <div className="grid gap-4">
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-1">Reasoning</h4>
        <p className="text-sm text-slate-300">{decision.reasoning}</p>
      </div>
      {decision.position && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Position</h4>
          <PositionPnLDisplay position={decision.position} />
        </div>
      )}
      {decision.llm_model && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Model</h4>
          <p className="text-sm text-slate-300">{decision.llm_model}</p>
        </div>
      )}
      {decision.atr_value != null && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">ATR Value</h4>
          <p className="text-sm text-slate-300">{(decision.atr_value * 100).toFixed(2)}%</p>
        </div>
      )}
      {decision.rejection_reason && (
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-1">Rejection Reason</h4>
          <p className="text-sm text-slate-300">{decision.rejection_reason}</p>
        </div>
      )}
    </div>
  )

  if (isError) {
    return (
      <PageLayout title="Trading Decisions" subtitle="View and filter trading decision history">
        <div className="text-red-400 text-center py-8">Error loading decisions</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Trading Decisions" subtitle="View and filter trading decision history">
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
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
          <StatusFilter
            label="Operation"
            options={OPERATION_OPTIONS}
            value={operation}
            onChange={setOperation}
          />
          <StatusFilter
            label="Volatility"
            options={VOLATILITY_OPTIONS}
            value={volatilityLevel}
            onChange={setVolatilityLevel}
          />
          <SearchFilter
            value={search}
            onChange={setSearch}
            placeholder="Search reasoning..."
          />
        </div>

        <DataTable
          data={decisions}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No decisions found"
          renderExpanded={renderExpanded}
          keyExtractor={(decision) => decision.id}
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
