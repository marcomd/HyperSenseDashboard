import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { SymbolFilter } from './SymbolFilter'

describe('SymbolFilter', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders a dropdown select', () => {
      render(<SymbolFilter {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders "All" option by default', () => {
      render(<SymbolFilter {...defaultProps} />)
      expect(screen.getByRole('option', { name: 'All Symbols' })).toBeInTheDocument()
    })

    it('renders symbol options', () => {
      render(<SymbolFilter {...defaultProps} />)
      expect(screen.getByRole('option', { name: 'BTC' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'ETH' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'SOL' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'BNB' })).toBeInTheDocument()
    })

    it('displays current selection', () => {
      render(<SymbolFilter {...defaultProps} value="ETH" />)
      expect(screen.getByRole('combobox')).toHaveValue('ETH')
    })

    it('shows "All Symbols" when value is empty', () => {
      render(<SymbolFilter {...defaultProps} value="" />)
      expect(screen.getByRole('combobox')).toHaveValue('')
    })
  })

  describe('interactions', () => {
    it('calls onChange when symbol is selected', () => {
      const onChange = vi.fn()
      render(<SymbolFilter {...defaultProps} onChange={onChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'BTC' } })

      expect(onChange).toHaveBeenCalledWith('BTC')
    })

    it('calls onChange with empty string when "All" is selected', () => {
      const onChange = vi.fn()
      render(<SymbolFilter {...defaultProps} value="BTC" onChange={onChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('custom symbols', () => {
    it('accepts custom symbols array', () => {
      render(<SymbolFilter {...defaultProps} symbols={['DOGE', 'XRP']} />)
      expect(screen.getByRole('option', { name: 'DOGE' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'XRP' })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: 'BTC' })).not.toBeInTheDocument()
    })
  })
})
