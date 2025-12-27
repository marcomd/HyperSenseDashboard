import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { StatusFilter } from './StatusFilter'

describe('StatusFilter', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    label: 'Status',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders a dropdown select', () => {
      render(<StatusFilter {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders "All" option by default', () => {
      render(<StatusFilter {...defaultProps} />)
      expect(screen.getByRole('option', { name: 'All Status' })).toBeInTheDocument()
    })

    it('renders all status options', () => {
      render(<StatusFilter {...defaultProps} />)
      expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Approved' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Rejected' })).toBeInTheDocument()
    })

    it('displays current selection', () => {
      render(<StatusFilter {...defaultProps} value="approved" />)
      expect(screen.getByRole('combobox')).toHaveValue('approved')
    })

    it('uses custom label for "All" option', () => {
      render(<StatusFilter {...defaultProps} label="Bias" />)
      expect(screen.getByRole('option', { name: 'All Bias' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onChange when status is selected', () => {
      const onChange = vi.fn()
      render(<StatusFilter {...defaultProps} onChange={onChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pending' } })

      expect(onChange).toHaveBeenCalledWith('pending')
    })

    it('calls onChange with empty string when "All" is selected', () => {
      const onChange = vi.fn()
      render(<StatusFilter {...defaultProps} value="approved" onChange={onChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('different use cases', () => {
    it('works for bias filter', () => {
      const biasOptions = [
        { value: 'bullish', label: 'Bullish' },
        { value: 'bearish', label: 'Bearish' },
        { value: 'neutral', label: 'Neutral' },
      ]
      render(<StatusFilter {...defaultProps} options={biasOptions} label="Bias" />)

      expect(screen.getByRole('option', { name: 'Bullish' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Bearish' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Neutral' })).toBeInTheDocument()
    })

    it('works for operation filter', () => {
      const operationOptions = [
        { value: 'open', label: 'Open' },
        { value: 'close', label: 'Close' },
        { value: 'hold', label: 'Hold' },
      ]
      render(<StatusFilter {...defaultProps} options={operationOptions} label="Operation" />)

      expect(screen.getByRole('option', { name: 'Open' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Close' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Hold' })).toBeInTheDocument()
    })
  })
})
