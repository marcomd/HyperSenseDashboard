import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { MacroStrategyCard } from './MacroStrategyCard'
import { createMacroStrategy } from '@/test/factories'

describe('MacroStrategyCard', () => {
  it('renders the Macro Strategy title', () => {
    render(<MacroStrategyCard strategy={createMacroStrategy()} />)
    expect(screen.getByText('Macro Strategy')).toBeInTheDocument()
  })

  describe('No Strategy State', () => {
    it('shows no active strategy message when strategy is null', () => {
      render(<MacroStrategyCard strategy={null} />)
      expect(screen.getByText('No active strategy')).toBeInTheDocument()
    })
  })

  describe('Bias Display', () => {
    it('displays bullish bias with green color', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ bias: 'bullish' })} />)
      const biasElement = screen.getByText('bullish')
      expect(biasElement).toBeInTheDocument()
      expect(biasElement).toHaveClass('text-green-400')
    })

    it('displays bearish bias with red color', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ bias: 'bearish' })} />)
      const biasElement = screen.getByText('bearish')
      expect(biasElement).toBeInTheDocument()
      expect(biasElement).toHaveClass('text-red-400')
    })

    it('displays neutral bias with slate color', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ bias: 'neutral' })} />)
      const biasElement = screen.getByText('neutral')
      expect(biasElement).toBeInTheDocument()
      expect(biasElement).toHaveClass('text-slate-400')
    })

    it('displays Market Bias label', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy()} />)
      expect(screen.getByText('Market Bias')).toBeInTheDocument()
    })
  })

  describe('Risk Tolerance', () => {
    it('displays risk tolerance as percentage', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ risk_tolerance: 0.7 })} />)
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(screen.getByText('Risk Tolerance')).toBeInTheDocument()
    })

    it('rounds risk tolerance correctly', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ risk_tolerance: 0.75 })} />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  describe('Market Narrative', () => {
    it('displays market narrative text', () => {
      const narrative = 'Bitcoin showing strength above key EMA levels'
      render(<MacroStrategyCard strategy={createMacroStrategy({ market_narrative: narrative })} />)
      expect(screen.getByText('Market Narrative')).toBeInTheDocument()
      expect(screen.getByText(narrative)).toBeInTheDocument()
    })
  })

  describe('Key Levels', () => {
    it('displays key levels section', () => {
      render(
        <MacroStrategyCard
          strategy={createMacroStrategy({
            key_levels: {
              BTC: { support: [95000], resistance: [100000] },
            },
          })}
        />
      )
      expect(screen.getByText('Key Levels')).toBeInTheDocument()
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    it('displays support levels', () => {
      const { container } = render(
        <MacroStrategyCard
          strategy={createMacroStrategy({
            key_levels: {
              BTC: { support: [95000, 92000], resistance: [100000] },
            },
          })}
        />
      )
      // Key levels section should be rendered
      expect(screen.getByText('Key Levels')).toBeInTheDocument()
      // Support section should have text starting with S:
      expect(container.textContent).toContain('S:')
    })

    it('displays resistance levels with R: prefix', () => {
      const { container } = render(
        <MacroStrategyCard
          strategy={createMacroStrategy({
            key_levels: {
              BTC: { support: [], resistance: [100000, 105000] },
            },
          })}
        />
      )
      // Resistance levels are rendered with red color
      const resistanceDiv = container.querySelector('.text-red-400')
      expect(resistanceDiv?.textContent).toContain('R:')
    })

    it('hides key levels section when key_levels is empty object', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ key_levels: {} })} />)
      expect(screen.queryByText('Key Levels')).not.toBeInTheDocument()
    })

    it('displays multiple asset levels', () => {
      render(
        <MacroStrategyCard
          strategy={createMacroStrategy({
            key_levels: {
              BTC: { support: [95000], resistance: [100000] },
              ETH: { support: [3200], resistance: [3600] },
            },
          })}
        />
      )
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })
  })

  describe('Stale Badge', () => {
    it('shows Stale badge when strategy is stale', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ stale: true })} />)
      expect(screen.getByText('Stale')).toBeInTheDocument()
    })

    it('hides Stale badge when strategy is not stale', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy({ stale: false })} />)
      expect(screen.queryByText('Stale')).not.toBeInTheDocument()
    })
  })

  describe('Timestamps', () => {
    it('displays created timestamp', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy()} />)
      expect(screen.getByText(/Created:/)).toBeInTheDocument()
    })

    it('displays valid until timestamp', () => {
      render(<MacroStrategyCard strategy={createMacroStrategy()} />)
      expect(screen.getByText(/Valid until:/)).toBeInTheDocument()
    })
  })
})
