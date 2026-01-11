import type {
  DashboardData,
  AccountSummary,
  SystemStatus,
  PerformanceData,
  PerformanceStats,
  EquityPoint,
  VolatilityInfo,
  HyperliquidAccount,
  BalanceHistory,
  RiskProfile,
  CostSummary,
  TradingMode,
} from '@/types'
import { createPosition } from './position'
import { createDecision } from './decision'
import { createMacroStrategy } from './macroStrategy'
import { createMarketOverviewMap } from './marketData'
import { createRiskProfile } from './riskProfile'

interface AccountSummaryOverrides {
  open_positions_count?: number
  total_unrealized_pnl?: number
  total_margin_used?: number
  realized_pnl_today?: number
  total_realized_pnl?: number
  all_time_pnl?: number
  calculated_pnl?: number | null
  capital_pnl_percent?: number | null
  balance_history?: Partial<BalanceHistory>
  paper_trading?: boolean
  circuit_breaker?: {
    daily_loss: number | null
    consecutive_losses: number | null
  }
  volatility_info?: VolatilityInfo | null
  hyperliquid?: HyperliquidAccount
  testnet_mode?: boolean
}

export function createAccountSummary(
  overrides: AccountSummaryOverrides = {}
): AccountSummary {
  return {
    open_positions_count: overrides.open_positions_count ?? 2,
    total_unrealized_pnl: overrides.total_unrealized_pnl ?? 150.0,
    total_margin_used: overrides.total_margin_used ?? 980.0,
    realized_pnl_today: overrides.realized_pnl_today ?? 75.5,
    total_realized_pnl: overrides.total_realized_pnl ?? 425.0,
    all_time_pnl: overrides.all_time_pnl ?? 575.0,
    calculated_pnl: overrides.calculated_pnl ?? 575.0,
    capital_pnl_percent: overrides.capital_pnl_percent ?? 57.5,
    balance_history: {
      initial_balance: 1000.0,
      total_deposits: 0,
      total_withdrawals: 0,
      last_sync: new Date().toISOString(),
      ...overrides.balance_history,
    },
    paper_trading: overrides.paper_trading ?? true,
    circuit_breaker: overrides.circuit_breaker ?? {
      daily_loss: -50,
      consecutive_losses: 0,
    },
    volatility_info: overrides.volatility_info === undefined
      ? {
          volatility_level: 'medium',
          atr_value: 0.015,
          next_cycle_interval: 12,
          next_cycle_at: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
          last_decision_at: new Date().toISOString(),
          intervals: { very_high: 3, high: 6, medium: 12, low: 25 },
        }
      : overrides.volatility_info,
    hyperliquid: overrides.hyperliquid ?? {
      balance: 947.06,
      available_margin: 850.0,
      margin_used: 97.06,
      positions_count: 2,
      configured: true,
    },
    testnet_mode: overrides.testnet_mode ?? true,
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
  cost_summary?: Partial<CostSummary>
  risk_profile?: Partial<RiskProfile>
  trading_mode?: Partial<TradingMode>
}

/**
 * Creates a mock CostSummary object for testing.
 */
function createCostSummary(overrides: Partial<CostSummary> = {}): CostSummary {
  return {
    period: overrides.period ?? 'today',
    trading_fees: overrides.trading_fees ?? 2.50,
    llm_costs: overrides.llm_costs ?? 0.15,
    server_cost_daily: overrides.server_cost_daily ?? 1.67,
    total_costs: overrides.total_costs ?? 4.32,
    gross_realized_pnl: overrides.gross_realized_pnl ?? 75.50,
    net_realized_pnl: overrides.net_realized_pnl ?? 71.18,
    llm_provider: overrides.llm_provider ?? 'anthropic',
    llm_model: overrides.llm_model ?? 'claude-sonnet-4-5',
  }
}

/**
 * Creates a mock TradingMode object for testing.
 */
export function createTradingMode(overrides: Partial<TradingMode> = {}): TradingMode {
  return {
    mode: overrides.mode ?? 'enabled',
    reason: overrides.reason ?? null,
    changed_by: overrides.changed_by ?? 'system',
    can_open: overrides.can_open ?? true,
    can_close: overrides.can_close ?? true,
    updated_at: overrides.updated_at ?? new Date().toISOString(),
  }
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
    cost_summary: createCostSummary(overrides.cost_summary),
    risk_profile: createRiskProfile(overrides.risk_profile),
    trading_mode: createTradingMode(overrides.trading_mode),
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

/**
 * Creates performance data with all negative cumulative PnL values.
 * Useful for testing the red gradient display.
 */
export function createNegativePerformanceData(): PerformanceData {
  return {
    equity_curve: [
      { date: '2024-01-01T00:00:00Z', daily_pnl: -50, cumulative_pnl: -50 },
      { date: '2024-01-02T00:00:00Z', daily_pnl: -30, cumulative_pnl: -80 },
      { date: '2024-01-03T00:00:00Z', daily_pnl: 20, cumulative_pnl: -60 },
      { date: '2024-01-04T00:00:00Z', daily_pnl: -20, cumulative_pnl: -80 },
      { date: '2024-01-05T00:00:00Z', daily_pnl: -10, cumulative_pnl: -90 },
    ],
    statistics: createPerformanceStats({
      total_trades: 5,
      wins: 1,
      losses: 4,
      win_rate: 20,
      total_pnl: -90,
      avg_win: 20,
      avg_loss: -27.5,
    }),
  }
}

/**
 * Creates performance data that crosses zero multiple times.
 * Useful for testing the dual-color gradient display.
 */
export function createMixedPerformanceData(): PerformanceData {
  return {
    equity_curve: [
      { date: '2024-01-01T00:00:00Z', daily_pnl: 100, cumulative_pnl: 100 },
      { date: '2024-01-02T00:00:00Z', daily_pnl: -150, cumulative_pnl: -50 },
      { date: '2024-01-03T00:00:00Z', daily_pnl: 100, cumulative_pnl: 50 },
      { date: '2024-01-04T00:00:00Z', daily_pnl: -100, cumulative_pnl: -50 },
      { date: '2024-01-05T00:00:00Z', daily_pnl: 80, cumulative_pnl: 30 },
    ],
    statistics: createPerformanceStats({
      total_trades: 5,
      wins: 3,
      losses: 2,
      win_rate: 60,
      total_pnl: 30,
      avg_win: 93.33,
      avg_loss: -125,
    }),
  }
}
