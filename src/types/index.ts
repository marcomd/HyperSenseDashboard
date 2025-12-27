// API Response Types

export type Bias = 'bullish' | 'bearish' | 'neutral';
export type Direction = 'long' | 'short';
export type PositionStatus = 'open' | 'closing' | 'closed';
export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
export type Operation = 'open' | 'close' | 'hold';
export type RsiSignal = 'oversold' | 'overbought' | 'neutral';
export type MacdSignal = 'bullish' | 'bearish';

// Position
export interface Position {
  id: number;
  symbol: string;
  direction: Direction;
  size: number;
  entry_price: number;
  current_price: number | null;
  leverage: number;
  margin_used: number | null;
  unrealized_pnl: number | null;
  pnl_percent: number;
  status: PositionStatus;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  risk_reward_ratio: number | null;
  opened_at: string;
  closed_at: string | null;
  close_reason: string | null;
  realized_pnl: number | null;
}

// Trading Decision
export interface TradingDecision {
  id: number;
  symbol: string;
  operation: Operation;
  direction: Direction | null;
  confidence: number | null;
  status: DecisionStatus;
  executed: boolean;
  rejection_reason: string | null;
  leverage: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  reasoning: string | null;
  created_at: string;
}

// Macro Strategy
export interface MacroStrategy {
  id: number;
  bias: Bias;
  risk_tolerance: number;
  market_narrative: string;
  key_levels?: Record<string, { support: number[]; resistance: number[] }>;
  valid_until: string;
  created_at: string;
  stale: boolean;
}

// Market Data
export interface MarketAsset {
  symbol: string;
  price: number;
  rsi_14: number | null;
  rsi_signal: RsiSignal | null;
  macd_signal: MacdSignal | null;
  ema_20: number | null;
  ema_50: number | null;
  ema_100: number | null;
  above_ema_20: boolean | null;
  above_ema_50: boolean | null;
  captured_at: string;
}

// Forecast
export interface Forecast {
  current_price: number;
  predicted_price: number;
  direction: Bias;
  change_pct: number;
  forecast_for: string;
  created_at: string;
}

// Dashboard Response
export interface DashboardData {
  account: AccountSummary;
  positions: Position[];
  market: Record<string, MarketOverview | null>;
  macro_strategy: MacroStrategy | null;
  recent_decisions: TradingDecision[];
  system_status: SystemStatus;
}

export interface AccountSummary {
  open_positions_count: number;
  total_unrealized_pnl: number;
  total_margin_used: number;
  realized_pnl_today: number;
  paper_trading: boolean;
  circuit_breaker: {
    trading_allowed: boolean;
    daily_loss: number | null;
    consecutive_losses: number | null;
  };
}

export interface MarketOverview {
  price: number;
  rsi: number | null;
  rsi_signal: RsiSignal | null;
  macd_signal: MacdSignal | null;
  above_ema_50: boolean | null;
  forecast_direction: Bias | null;
  forecast_change_pct: number | null;
  updated_at: string;
}

export interface SystemStatus {
  market_data: { healthy: boolean; last_update: string | null };
  trading_cycle: { healthy: boolean; last_run: string | null };
  macro_strategy: { healthy: boolean; last_update: string | null; stale: boolean | null };
  paper_trading: boolean;
  assets_tracked: string[];
}

// Performance/Equity Curve
export interface EquityPoint {
  date: string;
  daily_pnl: number;
  cumulative_pnl: number;
}

export interface PerformanceStats {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  avg_win: number;
  avg_loss: number;
}

export interface PerformanceData {
  equity_curve: EquityPoint[];
  statistics: PerformanceStats;
}

// OHLC Data for price charts
export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// WebSocket Message Types
export type WebSocketMessageType =
  | 'market_update'
  | 'position_update'
  | 'decision_update'
  | 'macro_strategy_update'
  | 'system_status_update';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data: T;
  timestamp: string;
  action?: string; // For position updates: opened, closed, updated
}

// API Pagination
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Filter Parameters
export interface ListFilterParams {
  startDate?: string;
  endDate?: string;
  symbol?: string;
  status?: string;
  operation?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// Market Snapshot for list view
export interface MarketSnapshot {
  id: number;
  symbol: string;
  price: number;
  indicators: {
    rsi_14?: number;
    ema_20?: number;
    ema_50?: number;
    ema_100?: number;
    macd?: {
      value: number;
      signal: number;
      histogram: number;
    };
    pivot_points?: Record<string, number>;
  };
  sentiment?: Record<string, unknown> | null;
  captured_at: string;
}

// Extended Forecast for list view
export interface ForecastListItem {
  id: number;
  symbol: string;
  timeframe: string;
  current_price: number;
  predicted_price: number;
  direction: Bias;
  change_pct: number;
  forecast_for: string;
  actual_price?: number | null;
  mae?: number | null;
  mape?: number | null;
  created_at: string;
}

// Extended Trading Decision with full context
export interface TradingDecisionDetail extends TradingDecision {
  target_position?: number | null;
  context_sent?: Record<string, unknown>;
  llm_response?: Record<string, unknown>;
  parsed_decision?: Record<string, unknown>;
  macro_strategy?: {
    id: number;
    bias: Bias;
    risk_tolerance: number;
  } | null;
}

// Extended Macro Strategy with full context
export interface MacroStrategyDetail extends MacroStrategy {
  context_used?: Record<string, unknown>;
  llm_response?: Record<string, unknown>;
}
