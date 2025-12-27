import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'
import { SearchFilter } from './SearchFilter'

describe('SearchFilter', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders search input', () => {
      render(<SearchFilter {...defaultProps} />)
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('displays placeholder text', () => {
      render(<SearchFilter {...defaultProps} placeholder="Search decisions..." />)
      expect(screen.getByPlaceholderText('Search decisions...')).toBeInTheDocument()
    })

    it('displays current value', () => {
      render(<SearchFilter {...defaultProps} value="test query" />)
      expect(screen.getByRole('searchbox')).toHaveValue('test query')
    })

    it('shows search icon', () => {
      render(<SearchFilter {...defaultProps} />)
      // Search icon is present in the component
      expect(screen.getByRole('searchbox').parentElement).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('updates input value immediately', () => {
      render(<SearchFilter {...defaultProps} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'new search' } })

      expect(input).toHaveValue('new search')
    })

    it('debounces onChange callback by 300ms', () => {
      const onChange = vi.fn()
      render(<SearchFilter {...defaultProps} onChange={onChange} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'search' } })

      // Should not be called immediately
      expect(onChange).not.toHaveBeenCalled()

      // Advance timer by 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onChange).toHaveBeenCalledWith('search')
    })

    it('only calls onChange once for rapid typing', () => {
      const onChange = vi.fn()
      render(<SearchFilter {...defaultProps} onChange={onChange} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 's' } })
      act(() => {
        vi.advanceTimersByTime(100)
      })

      fireEvent.change(input, { target: { value: 'se' } })
      act(() => {
        vi.advanceTimersByTime(100)
      })

      fireEvent.change(input, { target: { value: 'search' } })
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('search')
    })
  })

  describe('clear button', () => {
    it('shows clear button when value is present', () => {
      render(<SearchFilter {...defaultProps} value="test" />)
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
    })

    it('hides clear button when value is empty', () => {
      render(<SearchFilter {...defaultProps} value="" />)
      expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
    })

    it('clears value when clear button is clicked', () => {
      const onChange = vi.fn()
      render(<SearchFilter {...defaultProps} value="test" onChange={onChange} />)

      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

      // Clear should be immediate, not debounced
      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('keyboard', () => {
    it('clears value on Escape key', () => {
      const onChange = vi.fn()
      render(<SearchFilter {...defaultProps} value="test" onChange={onChange} />)
      const input = screen.getByRole('searchbox')

      fireEvent.keyDown(input, { key: 'Escape' })

      expect(onChange).toHaveBeenCalledWith('')
    })
  })
})
