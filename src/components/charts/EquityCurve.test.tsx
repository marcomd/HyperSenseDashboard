import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { EquityCurve } from './EquityCurve'
import { calculateGradientOffset } from '@/utils/chart'
import {
  createPerformanceData,
  createEmptyPerformanceData,
  createMixedPerformanceData,
  createNegativePerformanceData,
} from '@/test/factories'

// Mock Recharts components since they don't render properly in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}))

describe('EquityCurve', () => {
  it('renders the Performance title', () => {
    render(<EquityCurve data={createPerformanceData()} />)
    expect(screen.getByText('Performance')).toBeInTheDocument()
  })

  describe('Loading State', () => {
    it('shows loading state when isLoading is true', () => {
      render(<EquityCurve data={undefined} isLoading={true} />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no data', () => {
      render(<EquityCurve data={undefined} />)
      expect(screen.getByText('No performance data available')).toBeInTheDocument()
    })

    it('shows empty state when equity curve is empty', () => {
      render(<EquityCurve data={createEmptyPerformanceData()} />)
      expect(screen.getByText('No performance data available')).toBeInTheDocument()
    })
  })

  describe('Statistics', () => {
    it('displays win rate', () => {
      render(
        <EquityCurve
          data={createPerformanceData({ statistics: { win_rate: 65.5 } })}
        />
      )
      expect(screen.getByText('Win Rate')).toBeInTheDocument()
      expect(screen.getByText('65.5%')).toBeInTheDocument()
    })

    it('displays total trades', () => {
      render(
        <EquityCurve
          data={createPerformanceData({ statistics: { total_trades: 25 } })}
        />
      )
      expect(screen.getByText('Total Trades')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('displays average win', () => {
      render(
        <EquityCurve data={createPerformanceData({ statistics: { avg_win: 50.0 } })} />
      )
      expect(screen.getByText('Avg Win')).toBeInTheDocument()
      expect(screen.getByText('$50.00')).toBeInTheDocument()
    })

    it('displays average loss', () => {
      render(
        <EquityCurve
          data={createPerformanceData({ statistics: { avg_loss: -25.0 } })}
        />
      )
      expect(screen.getByText('Avg Loss')).toBeInTheDocument()
      expect(screen.getByText('$25.00')).toBeInTheDocument()
    })
  })

  describe('Total PnL Header', () => {
    it('displays positive total PnL with plus sign', () => {
      render(
        <EquityCurve
          data={createPerformanceData({ statistics: { total_pnl: 500.0 } })}
        />
      )
      const pnlElement = screen.getByText('+$500.00')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-green-400')
    })

    it('displays negative total PnL without plus sign', () => {
      render(
        <EquityCurve
          data={createPerformanceData({ statistics: { total_pnl: -150.0 } })}
        />
      )
      const pnlElement = screen.getByText('$-150.00')
      expect(pnlElement).toBeInTheDocument()
      expect(pnlElement).toHaveClass('text-red-400')
    })
  })

  describe('Win/Loss Breakdown', () => {
    it('displays wins count', () => {
      render(
        <EquityCurve data={createPerformanceData({ statistics: { wins: 15 } })} />
      )
      expect(screen.getByText('Wins')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('displays losses count', () => {
      render(
        <EquityCurve data={createPerformanceData({ statistics: { losses: 10 } })} />
      )
      expect(screen.getByText('Losses')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('Chart', () => {
    it('renders chart when data is available', () => {
      render(<EquityCurve data={createPerformanceData()} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('renders reference line at zero', () => {
      render(<EquityCurve data={createPerformanceData()} />)
      expect(screen.getByTestId('reference-line')).toBeInTheDocument()
    })

    it('renders chart with mixed positive/negative data', () => {
      render(<EquityCurve data={createMixedPerformanceData()} />)
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('renders chart with all negative data', () => {
      render(<EquityCurve data={createNegativePerformanceData()} />)
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })
})

describe('calculateGradientOffset', () => {
  it('returns 0.5 for empty data', () => {
    expect(calculateGradientOffset([])).toBe(0.5)
  })

  it('returns near 0 when all values are negative', () => {
    const data = [
      { date: '2024-01-01', daily_pnl: -10, cumulative_pnl: -10 },
      { date: '2024-01-02', daily_pnl: -5, cumulative_pnl: -15 },
    ]
    expect(calculateGradientOffset(data)).toBe(0.001)
  })

  it('returns near 1 when all values are positive', () => {
    const data = [
      { date: '2024-01-01', daily_pnl: 10, cumulative_pnl: 10 },
      { date: '2024-01-02', daily_pnl: 5, cumulative_pnl: 15 },
    ]
    expect(calculateGradientOffset(data)).toBe(0.999)
  })

  it('calculates correct offset when zero is in the middle', () => {
    const data = [
      { date: '2024-01-01', daily_pnl: -20, cumulative_pnl: -20 },
      { date: '2024-01-02', daily_pnl: 40, cumulative_pnl: 20 },
    ]
    // max = 20, min = -20, range = 40
    // offset = 20 / 40 = 0.5
    expect(calculateGradientOffset(data)).toBe(0.5)
  })

  it('calculates correct offset for asymmetric ranges', () => {
    const data = [
      { date: '2024-01-01', daily_pnl: 100, cumulative_pnl: 100 },
      { date: '2024-01-02', daily_pnl: -150, cumulative_pnl: -50 },
    ]
    // max = 100, min = -50, range = 150
    // offset = 100 / 150 = 0.6667
    expect(calculateGradientOffset(data)).toBeCloseTo(0.6667, 3)
  })

  it('handles data where max equals zero', () => {
    const data = [
      { date: '2024-01-01', daily_pnl: -10, cumulative_pnl: -10 },
      { date: '2024-01-02', daily_pnl: 10, cumulative_pnl: 0 },
    ]
    // max = 0, all values negative or zero
    expect(calculateGradientOffset(data)).toBe(0.001)
  })

  it('handles data where min equals zero', () => {
    const data = [
      { date: '2024-01-01', daily_pnl: 10, cumulative_pnl: 10 },
      { date: '2024-01-02', daily_pnl: -10, cumulative_pnl: 0 },
    ]
    // min = 0, all values positive or zero
    expect(calculateGradientOffset(data)).toBe(0.999)
  })
})
