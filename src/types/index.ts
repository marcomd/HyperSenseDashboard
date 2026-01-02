// API Response Types

export type Bias = 'bullish' | 'bearish' | 'neutral';
export type Direction = 'long' | 'short';
export type PositionStatus = 'open' | 'closing' | 'closed';
export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
export type Operation = 'open' | 'close' | 'hold';
export type RsiSignal = 'oversold' | 'overbought' | 'neutral';
export type MacdSignal = 'bullish' | 'bearish';
export type VolatilityLevel = 'very_high' | 'high' | 'medium' | 'low';

// Volatility intervals configuration (minutes per level)
export type VolatilityIntervals = Record<VolatilityLevel, number>;

// Volatility Info from latest trading decision
export interface VolatilityInfo {
  volatility_level: VolatilityLevel | null;
  atr_value: number | null;
  next_cycle_interval: number | null;
  next_cycle_at: string | null;
  last_decision_at: string | null;
  intervals?: VolatilityIntervals;
}

// Position Fees
export interface PositionFees {
  entry_fee: number;
  exit_fee: number;
  total_fees: number;
  net_pnl: number;
}

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
  fees?: PositionFees;
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
  volatility_level: VolatilityLevel | null;
  atr_value: number | null;
  next_cycle_interval: number | null;
  // llm_model is only in detailed view (expand to see)
  llm_model?: string | null;
  created_at: string;
}

// Macro Strategy
export interface MacroStrategy {
  id: number;
  bias: Bias;
  risk_tolerance: number;
  market_narrative: string;
  key_levels?: Record<string, { support: number[]; resistance: number[] }>;
  llm_model: string | null;
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

// Cost Summary for dashboard
export interface CostSummary {
  period: string;
  trading_fees: number;
  llm_costs: number;
  server_cost_daily: number;
  total_costs: number;
  gross_realized_pnl: number;
  net_realized_pnl: number;
  llm_provider: string;
  llm_model: string;
}

// Dashboard Response
export interface DashboardData {
  account: AccountSummary;
  positions: Position[];
  market: Record<string, MarketOverview | null>;
  macro_strategy: MacroStrategy | null;
  recent_decisions: TradingDecision[];
  system_status: SystemStatus;
  cost_summary: CostSummary;
}

// Hyperliquid account data from exchange API
export interface HyperliquidAccount {
  balance: number | null;
  available_margin: number | null;
  margin_used: number | null;
  positions_count: number | null;
  configured: boolean;
}

export interface AccountSummary {
  open_positions_count: number;
  total_unrealized_pnl: number;
  total_margin_used: number;
  realized_pnl_today: number;
  total_realized_pnl: number;
  all_time_pnl: number;
  paper_trading: boolean;
  circuit_breaker: {
    // Note: trading_allowed comes from TradingStatusContext (via /health endpoint)
    daily_loss: number | null;
    consecutive_losses: number | null;
  };
  volatility_info: VolatilityInfo | null;
  hyperliquid: HyperliquidAccount;
  testnet_mode: boolean;
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

// Extended SystemStatus with volatility info for next cycle timing display
export interface SystemStatusWithVolatility extends SystemStatus {
  volatility_info: VolatilityInfo | null;
}

// Performance/Equity Curve
export interface EquityPoint {
  date: string;
  daily_pnl: number;
  daily_fees?: number;
  cumulative_pnl: number;
  cumulative_fees?: number;
  cumulative_net_pnl?: number;
}

export interface PerformanceStats {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  total_fees?: number;
  net_pnl?: number;
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
  volatility_level?: string;
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
  // llm_model is always present in detailed view
  llm_model: string | null;
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

// Execution Log
export type ExecutionLogStatus = 'success' | 'failure';
export type ExecutionLogAction =
  | 'place_order'
  | 'cancel_order'
  | 'modify_order'
  | 'sync_position'
  | 'sync_account'
  | 'risk_trigger';

export interface ExecutionLog {
  id: number;
  action: ExecutionLogAction;
  status: ExecutionLogStatus;
  executed_at: string;
  created_at: string;
  loggable_type: string | null;
  loggable_id: number | null;
  // Detailed fields (only in show response)
  request_payload?: Record<string, unknown>;
  response_payload?: Record<string, unknown>;
  error_message?: string | null;
  duration_ms?: number | null;
}

export interface ExecutionLogsStats {
  period_hours: number;
  total_logs: number;
  by_status: Record<string, number>;
  by_action: Record<string, number>;
  success_rate: number;
}

// Detailed Cost Types (for /api/v1/costs endpoints)

export interface TradingFeesBreakdown {
  entry_fees: number;
  exit_fees: number;
  open_position_entry_fees: number;
  total: number;
  fee_rate: number;
  positions_counted: number;
}

export interface LLMPricing {
  input_per_million: number;
  output_per_million: number;
}

export interface LLMCostsBreakdown {
  provider: string;
  model: string;
  pricing: LLMPricing;
  macro_strategy: {
    calls: number;
    estimated_input_tokens: number;
    estimated_output_tokens: number;
    cost: number;
  };
  trading_decisions: {
    calls: number;
    estimated_input_tokens: number;
    estimated_output_tokens: number;
    cost: number;
  };
  total_calls: number;
  total: number;
}

export interface ServerCostBreakdown {
  monthly_rate: number;
  daily_rate: number;
  days: number;
  prorated: number;
}

export interface DetailedCosts {
  period: string;
  period_start: string | null;
  trading_fees: TradingFeesBreakdown;
  llm_costs: LLMCostsBreakdown;
  server_cost: ServerCostBreakdown;
  total_costs: number;
}

export interface NetPnL {
  gross_realized_pnl: number;
  gross_unrealized_pnl: number;
  trading_fees: number;
  net_realized_pnl: number;
  net_unrealized_pnl: number;
  net_total_pnl: number;
}

export interface CostsSummaryResponse {
  costs: DetailedCosts;
  pnl: NetPnL;
}

export interface CostsLLMResponse {
  today: LLMCostsBreakdown;
  week: LLMCostsBreakdown;
  month: LLMCostsBreakdown;
  pricing: {
    provider: string;
    model: string;
    pricing: LLMPricing;
  };
}

export interface CostsTradingResponse {
  today: TradingFeesBreakdown;
  week: TradingFeesBreakdown;
  month: TradingFeesBreakdown;
  fee_rates: {
    taker: number;
    maker: number;
    current: string;
  };
}
