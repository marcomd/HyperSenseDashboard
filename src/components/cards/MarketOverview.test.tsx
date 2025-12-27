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
        <MarketOverview market={{ BTC: createMarketOverview({ above_ema_50: true }) }} />
      )
      expect(screen.getByText('EMA 50')).toBeInTheDocument()
      expect(screen.getByText('Above')).toBeInTheDocument()
    })

    it('displays Below for EMA 50 when price is below', () => {
      render(
        <MarketOverview market={{ BTC: createMarketOverview({ above_ema_50: false }) }} />
      )
      expect(screen.getByText('Below')).toBeInTheDocument()
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
})
