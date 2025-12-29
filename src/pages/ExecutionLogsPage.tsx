import { useState } from 'react'
import { PageLayout, DataTable } from '@/components/common'
import {
  DateRangeFilter,
  StatusFilter,
  Pagination,
} from '@/components/filters'
import { useExecutionLogsList } from '@/hooks/useApi'
import type { ExecutionLog } from '@/types'

const STATUS_OPTIONS = [
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
]

const ACTION_OPTIONS = [
  { value: 'place_order', label: 'Place Order' },
  { value: 'cancel_order', label: 'Cancel Order' },
  { value: 'modify_order', label: 'Modify Order' },
  { value: 'sync_position', label: 'Sync Position' },
  { value: 'sync_account', label: 'Sync Account' },
  { value: 'risk_trigger', label: 'Risk Trigger' },
]

export function ExecutionLogsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, isError } = useExecutionLogsList({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: status || undefined,
    operation: action || undefined, // Maps to 'action' in API
    page,
    per_page: pageSize,
  })

  const logs = data?.execution_logs ?? []
  const meta = data?.meta ?? { page: 1, per_page: 25, total: 0, total_pages: 0 }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-green-400' : 'text-red-400'
  }

  const getActionLabel = (action: string) => {
    const option = ACTION_OPTIONS.find(opt => opt.value === action)
    return option?.label || action
  }

  const getLoggableLabel = (log: ExecutionLog) => {
    if (!log.loggable_type) return '-'
    return `${log.loggable_type} #${log.loggable_id}`
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (log: ExecutionLog) => (
        <span className="text-slate-400">#{log.id}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: ExecutionLog) => (
        <span className="font-medium">{getActionLabel(log.action)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (log: ExecutionLog) => (
        <span className={`capitalize ${getStatusColor(log.status)}`}>
          {log.status}
        </span>
      ),
    },
    {
      key: 'loggable',
      header: 'Related To',
      render: (log: ExecutionLog) => (
        <span className="text-slate-400">{getLoggableLabel(log)}</span>
      ),
    },
    {
      key: 'executed_at',
      header: 'Executed At',
      render: (log: ExecutionLog) => (
        <span className="text-slate-400 text-sm">{formatDate(log.executed_at)}</span>
      ),
    },
  ]

  const renderExpanded = (log: ExecutionLog) => (
    <div className="grid gap-4">
      {log.request_payload && Object.keys(log.request_payload).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Request Payload</h4>
          <pre className="text-sm text-slate-300 bg-bg-tertiary p-2 rounded overflow-x-auto">
            {JSON.stringify(log.request_payload, null, 2)}
          </pre>
        </div>
      )}
      {log.response_payload && Object.keys(log.response_payload).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Response Payload</h4>
          <pre className="text-sm text-slate-300 bg-bg-tertiary p-2 rounded overflow-x-auto">
            {JSON.stringify(log.response_payload, null, 2)}
          </pre>
        </div>
      )}
      {log.error_message && (
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-1">Error Message</h4>
          <p className="text-sm text-slate-300">{log.error_message}</p>
        </div>
      )}
      {log.duration_ms !== null && log.duration_ms !== undefined && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">Duration</h4>
          <p className="text-sm text-slate-300">{log.duration_ms} ms</p>
        </div>
      )}
    </div>
  )

  if (isError) {
    return (
      <PageLayout title="Execution Logs" subtitle="View and filter execution log history">
        <div className="text-red-400 text-center py-8">Error loading execution logs</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Execution Logs" subtitle="View and filter execution log history">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <StatusFilter
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
          <StatusFilter
            label="Action"
            options={ACTION_OPTIONS}
            value={action}
            onChange={setAction}
          />
        </div>

        <DataTable
          data={logs}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No execution logs found"
          renderExpanded={renderExpanded}
          keyExtractor={(log) => log.id}
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
