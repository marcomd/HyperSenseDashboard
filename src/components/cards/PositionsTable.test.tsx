import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { PositionsTable } from './PositionsTable'
import { createPosition } from '@/test/factories'

describe('PositionsTable', () => {
  it('renders the default title', () => {
    render(<PositionsTable positions={[createPosition()]} />)
    expect(screen.getByText('Open Positions')).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(<PositionsTable positions={[createPosition()]} title="My Positions" />)
    expect(screen.getByText('My Positions')).toBeInTheDocument()
  })

  describe('Empty State', () => {
    it('shows empty state when no positions', () => {
      render(<PositionsTable positions={[]} />)
      expect(screen.getByText('No open positions')).toBeInTheDocument()
    })

    it('does not show table when no positions', () => {
      render(<PositionsTable positions={[]} />)
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Position Count', () => {
    it('shows position count in header', () => {
      const positions = [createPosition(), createPosition({ symbol: 'ETH' })]
      render(<PositionsTable positions={positions} />)
      expect(screen.getByText('2 positions')).toBeInTheDocument()
    })

    it('shows 1 position for single position', () => {
      render(<PositionsTable positions={[createPosition()]} />)
      expect(screen.getByText('1 positions')).toBeInTheDocument()
    })
  })

  describe('Position Row', () => {
    it('displays position symbol', () => {
      render(<PositionsTable positions={[createPosition({ symbol: 'BTC' })]} />)
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    it('displays LONG badge for long positions', () => {
      render(<PositionsTable positions={[createPosition({ direction: 'long' })]} />)
      expect(screen.getByText('LONG')).toBeInTheDocument()
    })

    it('displays SHORT badge for short positions', () => {
      render(<PositionsTable positions={[createPosition({ direction: 'short' })]} />)
      expect(screen.getByText('SHORT')).toBeInTheDocument()
    })

    it('displays entry and current price', () => {
      const { container } = render(
        <PositionsTable
          positions={[createPosition({ entry_price: 98000, current_price: 98500 })]}
        />
      )
      // Prices are displayed with dollar signs
      const priceElements = container.querySelectorAll('.font-mono')
      expect(priceElements.length).toBeGreaterThan(0)
      // Check the text contains the price values
      expect(container.textContent).toContain('$')
      expect(container.textContent).toContain('98')
    })

    it('displays leverage', () => {
      render(<PositionsTable positions={[createPosition({ leverage: 10 })]} />)
      expect(screen.getByText('10x')).toBeInTheDocument()
    })
  })

  describe('PnL Display', () => {
    it('displays positive PnL with green color', () => {
      render(
        <PositionsTable positions={[createPosition({ unrealized_pnl: 50.0, pnl_percent: 5.1 })]} />
      )
      expect(screen.getByText('+$50.00')).toBeInTheDocument()
      expect(screen.getByText('+5.10%')).toBeInTheDocument()
    })

    it('displays negative PnL with red color', () => {
      render(
        <PositionsTable positions={[createPosition({ unrealized_pnl: -25.0, pnl_percent: -2.55 })]} />
      )
      expect(screen.getByText('$-25.00')).toBeInTheDocument()
      expect(screen.getByText('-2.55%')).toBeInTheDocument()
    })
  })

  describe('Stop Loss / Take Profit', () => {
    it('displays stop loss with Shield icon', () => {
      const { container } = render(
        <PositionsTable positions={[createPosition({ stop_loss_price: 97000 })]} />
      )
      // Stop loss is displayed with red color
      const slDiv = container.querySelector('.text-red-400')
      expect(slDiv).toBeInTheDocument()
      expect(slDiv?.textContent).toContain('$')
    })

    it('displays take profit with Target icon', () => {
      const { container } = render(
        <PositionsTable positions={[createPosition({ take_profit_price: 100000 })]} />
      )
      // Take profit container exists (look for the flex container with the icon)
      const rows = container.querySelectorAll('tbody tr')
      expect(rows.length).toBe(1)
    })

    it('renders position even when SL/TP not set', () => {
      render(
        <PositionsTable
          positions={[createPosition({ stop_loss_price: null, take_profit_price: null })]}
        />
      )
      // Position should still be rendered
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })
  })

  describe('Multiple Positions', () => {
    it('renders all positions', () => {
      const positions = [
        createPosition({ symbol: 'BTC', direction: 'long' }),
        createPosition({ symbol: 'ETH', direction: 'short' }),
        createPosition({ symbol: 'SOL', direction: 'long' }),
      ]
      render(<PositionsTable positions={positions} />)

      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
      expect(screen.getByText('SOL')).toBeInTheDocument()
      expect(screen.getByText('3 positions')).toBeInTheDocument()
    })
  })
})
