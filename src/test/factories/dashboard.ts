import type {
  DashboardData,
  AccountSummary,
  SystemStatus,
  PerformanceData,
  PerformanceStats,
  EquityPoint,
} from '@/types'
import { createPosition } from './position'
import { createDecision } from './decision'
import { createMacroStrategy } from './macroStrategy'
import { createMarketOverviewMap } from './marketData'

interface AccountSummaryOverrides {
  open_positions_count?: number
  total_unrealized_pnl?: number
  total_margin_used?: number
  realized_pnl_today?: number
  paper_trading?: boolean
  circuit_breaker?: {
    trading_allowed: boolean
    daily_loss: number | null
    consecutive_losses: number | null
  }
}

export function createAccountSummary(
  overrides: AccountSummaryOverrides = {}
): AccountSummary {
  return {
    open_positions_count: overrides.open_positions_count ?? 2,
    total_unrealized_pnl: overrides.total_unrealized_pnl ?? 150.0,
    total_margin_used: overrides.total_margin_used ?? 980.0,
    realized_pnl_today: overrides.realized_pnl_today ?? 75.5,
    paper_trading: overrides.paper_trading ?? true,
    circuit_breaker: overrides.circuit_breaker ?? {
      trading_allowed: true,
      daily_loss: -50,
      consecutive_losses: 0,
    },
  }
}

interface SystemStatusOverrides {
  market_data?: { healthy: boolean; last_update: string | null }
  trading_cycle?: { healthy: boolean; last_run: string | null }
  macro_strategy?: {
    healthy: boolean
    last_update: string | null
    stale: boolean | null
  }
  paper_trading?: boolean
  assets_tracked?: string[]
}

export function createSystemStatus(
  overrides: SystemStatusOverrides = {}
): SystemStatus {
  return {
    market_data: overrides.market_data ?? {
      healthy: true,
      last_update: new Date().toISOString(),
    },
    trading_cycle: overrides.trading_cycle ?? {
      healthy: true,
      last_run: new Date().toISOString(),
    },
    macro_strategy: overrides.macro_strategy ?? {
      healthy: true,
      last_update: new Date().toISOString(),
      stale: false,
    },
    paper_trading: overrides.paper_trading ?? true,
    assets_tracked: overrides.assets_tracked ?? ['BTC', 'ETH', 'SOL'],
  }
}

interface DashboardDataOverrides {
  account?: Partial<AccountSummary>
  positions?: ReturnType<typeof createPosition>[]
  market?: Record<string, ReturnType<typeof createMarketOverviewMap>[string]>
  macro_strategy?: ReturnType<typeof createMacroStrategy> | null
  recent_decisions?: ReturnType<typeof createDecision>[]
  system_status?: Partial<SystemStatus>
}

export function createDashboardData(
  overrides: DashboardDataOverrides = {}
): DashboardData {
  return {
    account: createAccountSummary(overrides.account),
    positions: overrides.positions ?? [
      createPosition({ symbol: 'BTC', direction: 'long' }),
      createPosition({ symbol: 'ETH', direction: 'short', entry_price: 3400, current_price: 3450 }),
    ],
    market: overrides.market ?? createMarketOverviewMap(),
    macro_strategy: overrides.macro_strategy ?? createMacroStrategy(),
    recent_decisions: overrides.recent_decisions ?? [
      createDecision({ operation: 'open', status: 'executed' }),
      createDecision({ operation: 'hold', status: 'executed', symbol: 'ETH' }),
    ],
    system_status: createSystemStatus(overrides.system_status),
  }
}

interface PerformanceStatsOverrides {
  total_trades?: number
  wins?: number
  losses?: number
  win_rate?: number
  total_pnl?: number
  avg_win?: number
  avg_loss?: number
}

export function createPerformanceStats(
  overrides: PerformanceStatsOverrides = {}
): PerformanceStats {
  const wins = overrides.wins ?? 15
  const losses = overrides.losses ?? 10
  const total_trades = overrides.total_trades ?? wins + losses

  return {
    total_trades,
    wins,
    losses,
    win_rate: overrides.win_rate ?? (wins / total_trades) * 100,
    total_pnl: overrides.total_pnl ?? 500.0,
    avg_win: overrides.avg_win ?? 50.0,
    avg_loss: overrides.avg_loss ?? -25.0,
  }
}

interface PerformanceDataOverrides {
  equity_curve?: EquityPoint[]
  statistics?: Partial<PerformanceStats>
  days?: number
}

export function createPerformanceData(
  overrides: PerformanceDataOverrides = {}
): PerformanceData {
  const days = overrides.days ?? 30

  const equity_curve: EquityPoint[] =
    overrides.equity_curve ??
    Array.from({ length: days }, (_, i) => {
      const daily_pnl = Math.random() * 100 - 30 // -30 to +70
      return {
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
        daily_pnl,
        cumulative_pnl: i * 15 + daily_pnl, // Generally upward trend
      }
    })

  return {
    equity_curve,
    statistics: createPerformanceStats(overrides.statistics),
  }
}

export function createEmptyPerformanceData(): PerformanceData {
  return {
    equity_curve: [],
    statistics: createPerformanceStats({
      total_trades: 0,
      wins: 0,
      losses: 0,
      win_rate: 0,
      total_pnl: 0,
      avg_win: 0,
      avg_loss: 0,
    }),
  }
}
