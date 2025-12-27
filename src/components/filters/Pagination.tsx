import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  const handlePrev = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value))
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 border-t border-slate-700">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="bg-bg-tertiary border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirstPage}
          aria-label="Previous page"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm text-white px-2">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={isLastPage}
          aria-label="Next page"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
