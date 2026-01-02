import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { MarketOverview } from './MarketOverview'
import { createMarketOverview, createMarketOverviewMap } from '@/test/factories'

describe('MarketOverview', () => {
  it('renders the Market Overview title', () => {
    render(<MarketOverview market={createMarketOverviewMap()} />)
    expect(screen.getByText('Market Overview')).toBeInTheDocument()
  })

  describe('Empty State', () => {
    it('shows empty state when no market data', () => {
      render(<MarketOverview market={{}} />)
      expect(screen.getByText('No market data available')).toBeInTheDocument()
    })

    it('shows empty state when all values are null', () => {
      render(<MarketOverview market={{ BTC: null, ETH: null }} />)
      expect(screen.getByText('No market data available')).toBeInTheDocument()
    })
  })

  describe('Asset Card', () => {
    it('displays asset symbol', () => {
      render(<MarketOverview market={{ BTC: createMarketOverview() }} />)
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    it('displays formatted price', () => {
      const { container } = render(
        <MarketOverview market={{ BTC: createMarketOverview({ price: 98500 }) }} />
      )
      // Price is displayed in the card - check for the dollar sign and the value
      expect(container.textContent).toContain('$')
      expect(container.textContent).toContain('98')
    })

    it('displays RSI value', () => {
      render(<MarketOverview market={{ BTC: createMarketOverview({ rsi: 55.5 }) }} />)
      expect(screen.getByText('RSI')).toBeInTheDocument()
      expect(screen.getByText(/55\.5/)).toBeInTheDocument()
    })

    it('displays RSI signal when available', () => {
      render(
        <MarketOverview
          market={{ BTC: createMarketOverview({ rsi: 25, rsi_signal: 'oversold' }) }}
        />
      )
      // RSI value and signal are rendered together
      const rsiElement = screen.getByText(/25\.0/)
      expect(rsiElement).toBeInTheDocument()
    })

    it('displays MACD signal', () => {
      render(
        <MarketOverview market={{ BTC: createMarketOverview({ macd_signal: 'bullish' }) }} />
      )
      expect(screen.getByText('MACD')).toBeInTheDocument()
      expect(screen.getByText('bullish')).toBeInTheDocument()
    })

    it('displays Above for EMA 50 when price is above', () => {
      render(
        <MarketOverview market={{ BTC: createMarketOverview({ above_ema_50: true, above_ema_200: false }) }} />
      )
      expect(screen.getByText('EMA 50')).toBeInTheDocument()
      // Check EMA 50 shows Above (EMA 200 set to false to avoid duplicate)
      expect(screen.getAllByText('Above')).toHaveLength(1)
    })

    it('displays Below for EMA 50 when price is below', () => {
      render(
        <MarketOverview market={{ BTC: createMarketOverview({ above_ema_50: false, above_ema_200: null }) }} />
      )
      expect(screen.getAllByText('Below')).toHaveLength(1)
    })

    it('displays Above for EMA 200 when price is above', () => {
      render(
        <MarketOverview market={{ BTC: createMarketOverview({ above_ema_50: null, above_ema_200: true }) }} />
      )
      expect(screen.getByText('EMA 200')).toBeInTheDocument()
      expect(screen.getAllByText('Above')).toHaveLength(1)
    })

    it('displays Below for EMA 200 when price is below', () => {
      render(
        <MarketOverview market={{ BTC: createMarketOverview({ above_ema_50: null, above_ema_200: false }) }} />
      )
      expect(screen.getByText('EMA 200')).toBeInTheDocument()
      expect(screen.getAllByText('Below')).toHaveLength(1)
    })
  })

  describe('Forecast', () => {
    it('displays forecast section when available', () => {
      render(
        <MarketOverview
          market={{ BTC: createMarketOverview({ forecast_change_pct: 2.5 }) }}
        />
      )
      expect(screen.getByText('1h Forecast')).toBeInTheDocument()
    })

    it('displays forecast percentage', () => {
      const { container } = render(
        <MarketOverview
          market={{ BTC: createMarketOverview({ forecast_change_pct: -1.5 }) }}
        />
      )
      // Forecast is displayed
      expect(screen.getByText('1h Forecast')).toBeInTheDocument()
      // Contains percentage text
      expect(container.textContent).toContain('%')
    })

    it('hides forecast when null', () => {
      // Create a market overview manually with null forecast
      const marketData = {
        price: 98500,
        rsi: 55,
        rsi_signal: 'neutral' as const,
        macd_signal: 'bullish' as const,
        above_ema_50: true,
        above_ema_200: true,
        forecast_direction: null,
        forecast_change_pct: null,
        updated_at: new Date().toISOString(),
      }
      render(<MarketOverview market={{ BTC: marketData }} />)
      expect(screen.queryByText('1h Forecast')).not.toBeInTheDocument()
    })
  })

  describe('Multiple Assets', () => {
    it('renders all assets', () => {
      const market = createMarketOverviewMap()
      render(<MarketOverview market={market} />)

      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
      expect(screen.getByText('SOL')).toBeInTheDocument()
    })
  })

  describe('Volatility Badge', () => {
    it('displays volatility row with label when recentDecisions provided', () => {
      const market = { BTC: createMarketOverview() }
      const recentDecisions = [
        { id: 1, symbol: 'BTC', volatility_level: 'high' as const, operation: 'open' as const, direction: 'long' as const, confidence: 0.8, status: 'executed' as const, executed: true, rejection_reason: null, leverage: 5, stop_loss: 95000, take_profit: 105000, reasoning: 'Test', atr_value: 0.025, next_cycle_interval: 6, created_at: new Date().toISOString() },
      ]
      render(<MarketOverview market={market} recentDecisions={recentDecisions} />)
      expect(screen.getByText('Volatility')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('displays correct volatility level for each symbol', () => {
      const market = {
        BTC: createMarketOverview(),
        ETH: createMarketOverview({ price: 3500 }),
      }
      const recentDecisions = [
        { id: 1, symbol: 'BTC', volatility_level: 'very_high' as const, operation: 'open' as const, direction: 'long' as const, confidence: 0.8, status: 'executed' as const, executed: true, rejection_reason: null, leverage: 5, stop_loss: 95000, take_profit: 105000, reasoning: 'Test', atr_value: 0.035, next_cycle_interval: 3, created_at: new Date().toISOString() },
        { id: 2, symbol: 'ETH', volatility_level: 'low' as const, operation: 'open' as const, direction: 'long' as const, confidence: 0.7, status: 'executed' as const, executed: true, rejection_reason: null, leverage: 3, stop_loss: 3200, take_profit: 4000, reasoning: 'Test', atr_value: 0.008, next_cycle_interval: 25, created_at: new Date().toISOString() },
      ]
      render(<MarketOverview market={market} recentDecisions={recentDecisions} />)
      expect(screen.getByText('Very High')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
    })

    it('does not display volatility row when no matching decision', () => {
      const market = { BTC: createMarketOverview() }
      const recentDecisions = [
        { id: 1, symbol: 'ETH', volatility_level: 'high' as const, operation: 'open' as const, direction: 'long' as const, confidence: 0.8, status: 'executed' as const, executed: true, rejection_reason: null, leverage: 5, stop_loss: 3200, take_profit: 4000, reasoning: 'Test', atr_value: 0.025, next_cycle_interval: 6, created_at: new Date().toISOString() },
      ]
      render(<MarketOverview market={market} recentDecisions={recentDecisions} />)
      // BTC should render but without volatility row
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.queryByText('High')).not.toBeInTheDocument()
    })

    it('does not display volatility row without recentDecisions prop', () => {
      const market = { BTC: createMarketOverview() }
      render(<MarketOverview market={market} />)
      expect(screen.getByText('BTC')).toBeInTheDocument()
      // No volatility rows should be displayed
      expect(screen.queryByText('High')).not.toBeInTheDocument()
      expect(screen.queryByText('Low')).not.toBeInTheDocument()
    })
  })
})
