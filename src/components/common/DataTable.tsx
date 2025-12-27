import { Fragment, useState } from 'react'
import { ChevronDown, ChevronUp, FileX } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  renderExpanded?: (item: T) => React.ReactNode
  keyExtractor?: (item: T) => string | number
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found',
  onRowClick,
  renderExpanded,
  keyExtractor,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())

  const getKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item)
    if (item.id !== undefined) return item.id
    return index
  }

  const toggleExpand = (key: string | number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const getCellValue = (item: T, column: Column<T>): React.ReactNode => {
    if (column.render) {
      return column.render(item)
    }
    const value = item[column.key as keyof T]
    if (value === null || value === undefined) return '-'
    return String(value)
  }

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {renderExpanded && <th className="w-10" />}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider py-3 px-4"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-testid="loading-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-slate-700/50">
                {renderExpanded && <td className="py-3 px-2" />}
                {columns.map((column) => (
                  <td key={String(column.key)} className="py-3 px-4">
                    <div className="h-4 bg-slate-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider py-3 px-4"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FileX className="w-12 h-12 mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {renderExpanded && <th className="w-10" />}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`text-left text-xs font-medium text-slate-400 uppercase tracking-wider py-3 px-4 ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const key = getKey(item, index)
            const isExpanded = expandedRows.has(key)

            return (
              <Fragment key={key}>
                <tr
                  className={`border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {renderExpanded && (
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(key)
                        }}
                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`py-3 px-4 text-sm text-white ${column.className || ''}`}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                </tr>
                {isExpanded && renderExpanded && (
                  <tr className="bg-slate-800/30">
                    <td colSpan={columns.length + 1} className="py-4 px-6">
                      {renderExpanded(item)}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
