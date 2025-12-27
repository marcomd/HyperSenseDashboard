import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 100,
    pageSize: 25,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays "Page X of Y" info', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
    })

    it('displays total items count', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByText('100 items')).toBeInTheDocument()
    })

    it('renders prev button', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    })

    it('renders next button', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    })

    it('renders page size selector', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('disables prev button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    })

    it('enables prev button on subsequent pages', () => {
      render(<Pagination {...defaultProps} currentPage={2} />)
      expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled()
    })

    it('disables next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />)
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    })

    it('enables next button on earlier pages', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={5} />)
      expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled()
    })

    it('calls onPageChange with previous page when prev clicked', () => {
      const onPageChange = vi.fn()
      render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)

      fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))

      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageChange with next page when next clicked', () => {
      const onPageChange = vi.fn()
      render(<Pagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />)

      fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

      expect(onPageChange).toHaveBeenCalledWith(3)
    })
  })

  describe('page size', () => {
    it('displays current page size', () => {
      render(<Pagination {...defaultProps} pageSize={50} />)
      expect(screen.getByRole('combobox')).toHaveValue('50')
    })

    it('calls onPageSizeChange when page size changes', () => {
      const onPageSizeChange = vi.fn()
      render(<Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } })

      expect(onPageSizeChange).toHaveBeenCalledWith(50)
    })

    it('offers standard page size options', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByRole('option', { name: '10 / page' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '25 / page' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '50 / page' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '100 / page' })).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles single page', () => {
      render(<Pagination {...defaultProps} totalPages={1} />)
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    })

    it('handles zero items', () => {
      render(<Pagination {...defaultProps} totalItems={0} totalPages={0} />)
      expect(screen.getByText('0 items')).toBeInTheDocument()
    })

    it('handles singular item count', () => {
      render(<Pagination {...defaultProps} totalItems={1} />)
      expect(screen.getByText('1 item')).toBeInTheDocument()
    })
  })
})
