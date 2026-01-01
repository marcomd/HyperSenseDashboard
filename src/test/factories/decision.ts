import type {
  TradingDecision,
  Operation,
  Direction,
  DecisionStatus,
  VolatilityLevel,
} from '@/types'

let idCounter = 1

interface DecisionOverrides {
  id?: number
  symbol?: string
  operation?: Operation
  direction?: Direction | null
  confidence?: number | null
  status?: DecisionStatus
  executed?: boolean
  rejection_reason?: string | null
  leverage?: number | null
  stop_loss?: number | null
  take_profit?: number | null
  reasoning?: string | null
  volatility_level?: VolatilityLevel | null
  atr_value?: number | null
  next_cycle_interval?: number | null
  llm_model?: string | null
  created_at?: string
}

export function createDecision(overrides: DecisionOverrides = {}): TradingDecision {
  const id = overrides.id ?? idCounter++
  const operation = overrides.operation ?? 'open'
  const status = overrides.status ?? 'executed'

  return {
    id,
    symbol: overrides.symbol ?? 'BTC',
    operation,
    direction: overrides.direction ?? (operation === 'hold' ? null : 'long'),
    confidence: overrides.confidence ?? 0.85,
    status,
    executed: overrides.executed ?? status === 'executed',
    rejection_reason: overrides.rejection_reason ?? null,
    leverage: overrides.leverage ?? (operation === 'open' ? 10 : null),
    stop_loss: overrides.stop_loss ?? (operation === 'open' ? 97000 : null),
    take_profit: overrides.take_profit ?? (operation === 'open' ? 100000 : null),
    reasoning:
      overrides.reasoning ??
      'Strong bullish momentum with RSI breakout above 50 level.',
    volatility_level: overrides.volatility_level === undefined ? 'medium' : overrides.volatility_level,
    atr_value: overrides.atr_value === undefined ? 0.015 : overrides.atr_value,
    next_cycle_interval: overrides.next_cycle_interval === undefined ? 12 : overrides.next_cycle_interval,
    llm_model: overrides.llm_model === undefined ? 'claude-sonnet-4-5' : overrides.llm_model,
    created_at: overrides.created_at ?? new Date().toISOString(),
  }
}

export function resetDecisionIdCounter() {
  idCounter = 1
}
