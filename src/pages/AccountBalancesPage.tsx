import { useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react'
import clsx from 'clsx'
import { PageLayout, DataTable } from '@/components/common'
import {
  DateRangeFilter,
  StatusFilter,
  Pagination,
} from '@/components/filters'
import { useAccountBalancesList, useAccountBalanceSummary } from '@/hooks/useApi'
import type { AccountBalance, AccountBalanceEventType } from '@/types'

const EVENT_TYPE_OPTIONS: { value: AccountBalanceEventType; label: string }[] = [
  { value: 'initial', label: 'Initial' },
  { value: 'sync', label: 'Sync' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'adjustment', label: 'Adjustment' },
]

export function AccountBalancesPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [eventType, setEventType] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data: summaryData } = useAccountBalanceSummary()

  const { data, isLoading, isError } = useAccountBalancesList({
    from: startDate || undefined,
    to: endDate || undefined,
    event_type: eventType as AccountBalanceEventType | undefined,
    page,
    per_page: pageSize,
  })

  const balances = data?.account_balances ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatMoney = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-'
    const formatted = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return value >= 0 ? `$${formatted}` : `-$${formatted}`
  }

  const getEventTypeColor = (type: AccountBalanceEventType) => {
    switch (type) {
      case 'initial':
        return 'text-blue-400'
      case 'deposit':
        return 'text-green-400'
      case 'withdrawal':
        return 'text-red-400'
      case 'adjustment':
        return 'text-yellow-400'
      case 'sync':
      default:
        return 'text-slate-400'
    }
  }

  const getEventTypeIcon = (type: AccountBalanceEventType) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle className="w-4 h-4 text-green-400" />
      case 'withdrawal':
        return <ArrowDownCircle className="w-4 h-4 text-red-400" />
      case 'initial':
        return <Wallet className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (balance: AccountBalance) => (
        <span className="text-slate-400">#{balance.id}</span>
      ),
    },
    {
      key: 'event_type',
      header: 'Event',
      render: (balance: AccountBalance) => (
        <div className="flex items-center gap-2">
          {getEventTypeIcon(balance.event_type)}
          <span className={`capitalize ${getEventTypeColor(balance.event_type)}`}>
            {balance.event_type}
          </span>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (balance: AccountBalance) => (
        <span className="font-medium">{formatMoney(balance.balance)}</span>
      ),
    },
    {
      key: 'delta',
      header: 'Change',
      render: (balance: AccountBalance) => {
        if (balance.delta === null) return <span className="text-slate-500">-</span>
        const isPositive = balance.delta >= 0
        return (
          <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
            {isPositive ? '+' : ''}{formatMoney(balance.delta)}
          </span>
        )
      },
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (balance: AccountBalance) => (
        <span className="text-slate-400 text-sm truncate max-w-[200px]">
          {balance.notes || '-'}
        </span>
      ),
    },
    {
      key: 'recorded_at',
      header: 'Recorded',
      render: (balance: AccountBalance) => (
        <span className="text-slate-400 text-sm">{formatDate(balance.recorded_at)}</span>
      ),
    },
  ]

  const renderExpanded = (balance: AccountBalance) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-medium text-slate-400">Previous Balance</h4>
          <p className="text-sm text-slate-300">{formatMoney(balance.previous_balance)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-400">Source</h4>
          <p className="text-sm text-slate-300 capitalize">{balance.source}</p>
        </div>
      </div>
      <div className="space-y-2">
        {balance.notes && (
          <div>
            <h4 className="text-sm font-medium text-slate-400">Notes</h4>
            <p className="text-sm text-slate-300">{balance.notes}</p>
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium text-slate-400">Created At</h4>
          <p className="text-sm text-slate-300">{formatDate(balance.created_at)}</p>
        </div>
      </div>
    </div>
  )

  if (isError) {
    return (
      <PageLayout title="Account Balances" subtitle="Track balance history, deposits, and withdrawals">
        <div className="text-red-400 text-center py-8">Error loading balance history</div>
      </PageLayout>
    )
  }

  const calculatedPnlProfitable = (summaryData?.calculated_pnl ?? 0) >= 0

  return (
    <PageLayout title="Account Balances" subtitle="Track balance history, deposits, and withdrawals">
      <div className="space-y-6">
        {/* Summary Card */}
        {summaryData && (
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Initial Balance */}
                <div className="bg-bg-tertiary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Wallet className="w-4 h-4" />
                    <span>Initial Balance</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatMoney(summaryData.initial_balance)}
                  </div>
                </div>

                {/* Current Balance */}
                <div className="bg-bg-tertiary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Wallet className="w-4 h-4" />
                    <span>Current Balance</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatMoney(summaryData.current_balance)}
                  </div>
                </div>

                {/* Total Deposits */}
                <div className="bg-bg-tertiary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <ArrowUpCircle className="w-4 h-4 text-green-400" />
                    <span>Total Deposits</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    +{formatMoney(summaryData.total_deposits)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {summaryData.deposits_count} deposit{summaryData.deposits_count !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Total Withdrawals */}
                <div className="bg-bg-tertiary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                    <span>Total Withdrawals</span>
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    -{formatMoney(summaryData.total_withdrawals)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {summaryData.withdrawals_count} withdrawal{summaryData.withdrawals_count !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Calculated PnL */}
                <div className="bg-bg-tertiary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    {calculatedPnlProfitable ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span>Calculated P&L</span>
                  </div>
                  <div
                    className={clsx(
                      'text-xl font-bold',
                      calculatedPnlProfitable ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {calculatedPnlProfitable ? '+' : ''}{formatMoney(summaryData.calculated_pnl)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {summaryData.record_count} balance record{summaryData.record_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <StatusFilter
            label="Event Type"
            options={EVENT_TYPE_OPTIONS}
            value={eventType}
            onChange={setEventType}
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={balances}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No balance records found"
          renderExpanded={renderExpanded}
          keyExtractor={(balance) => balance.id}
        />

        {/* Pagination */}
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
