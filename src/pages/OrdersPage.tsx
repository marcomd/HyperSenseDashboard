import { useState } from 'react'
import { PageLayout, DataTable } from '@/components/common'
import {
  DateRangeFilter,
  SymbolFilter,
  StatusFilter,
  Pagination,
} from '@/components/filters'
import { useOrdersList } from '@/hooks/useApi'
import type { Order, OrderStatus, OrderSide, OrderType } from '@/types'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'filled', label: 'Filled' },
  { value: 'partially_filled', label: 'Partial' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
]

const SIDE_OPTIONS: { value: OrderSide; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
]

const TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop_limit', label: 'Stop Limit' },
]

export function OrdersPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [symbol, setSymbol] = useState('')
  const [status, setStatus] = useState('')
  const [side, setSide] = useState('')
  const [orderType, setOrderType] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, isError } = useOrdersList({
    from: startDate || undefined,
    to: endDate || undefined,
    symbol: symbol || undefined,
    status: status as OrderStatus | undefined,
    side: side as OrderSide | undefined,
    order_type: orderType as OrderType | undefined,
    page,
    per_page: pageSize,
  })

  const orders = data?.orders ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return '-'
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'filled':
        return 'text-green-400'
      case 'partially_filled':
        return 'text-yellow-400'
      case 'cancelled':
        return 'text-slate-400'
      case 'failed':
        return 'text-red-400'
      case 'pending':
        return 'text-blue-400'
      case 'submitted':
        return 'text-cyan-400'
      default:
        return 'text-slate-400'
    }
  }

  const getSideColor = (side: OrderSide) => {
    return side === 'buy' ? 'text-green-400' : 'text-red-400'
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (order: Order) => (
        <span className="text-slate-400">#{order.id}</span>
      ),
    },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (order: Order) => (
        <span className="font-medium">{order.symbol}</span>
      ),
    },
    {
      key: 'side',
      header: 'Side',
      render: (order: Order) => (
        <span className={`uppercase font-medium ${getSideColor(order.side)}`}>
          {order.side}
        </span>
      ),
    },
    {
      key: 'order_type',
      header: 'Type',
      render: (order: Order) => (
        <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      render: (order: Order) => (
        <span>{order.size.toFixed(4)}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (order: Order) => (
        <span>{formatPrice(order.price)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => (
        <span className={`capitalize ${getStatusColor(order.status)}`}>
          {order.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'fill_percent',
      header: 'Filled',
      render: (order: Order) => (
        <span className="text-slate-300">{order.fill_percent.toFixed(0)}%</span>
      ),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (order: Order) => (
        <span className="text-slate-400 text-sm">{formatDate(order.submitted_at)}</span>
      ),
    },
  ]

  const renderExpanded = (order: Order) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-medium text-slate-400">Order ID</h4>
          <p className="text-sm text-slate-300">{order.hyperliquid_order_id || '-'}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-400">Average Fill Price</h4>
          <p className="text-sm text-slate-300">{formatPrice(order.average_fill_price)}</p>
        </div>
        {order.stop_price && (
          <div>
            <h4 className="text-sm font-medium text-slate-400">Stop Price</h4>
            <p className="text-sm text-slate-300">{formatPrice(order.stop_price)}</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-medium text-slate-400">Filled Size</h4>
          <p className="text-sm text-slate-300">
            {order.filled_size?.toFixed(4) ?? '0'} / {order.size.toFixed(4)}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-400">Created</h4>
          <p className="text-sm text-slate-300">{formatDate(order.created_at)}</p>
        </div>
        {order.filled_at && (
          <div>
            <h4 className="text-sm font-medium text-slate-400">Filled At</h4>
            <p className="text-sm text-slate-300">{formatDate(order.filled_at)}</p>
          </div>
        )}
      </div>
    </div>
  )

  if (isError) {
    return (
      <PageLayout title="Orders" subtitle="View and filter order history">
        <div className="text-red-400 text-center py-8">Error loading orders</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Orders" subtitle="View and filter order history">
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
            label="Side"
            options={SIDE_OPTIONS}
            value={side}
            onChange={setSide}
          />
          <StatusFilter
            label="Type"
            options={TYPE_OPTIONS}
            value={orderType}
            onChange={setOrderType}
          />
        </div>

        <DataTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No orders found"
          renderExpanded={renderExpanded}
          keyExtractor={(order) => order.id}
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
