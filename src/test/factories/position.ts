import type { Position, Direction, PositionStatus } from '@/types'

let idCounter = 1

interface PositionOverrides {
  id?: number
  symbol?: string
  direction?: Direction
  size?: number
  entry_price?: number
  current_price?: number | null
  leverage?: number
  status?: PositionStatus
  unrealized_pnl?: number | null
  pnl_percent?: number
  stop_loss_price?: number | null
  take_profit_price?: number | null
  margin_used?: number | null
  risk_reward_ratio?: number | null
  opened_at?: string
  closed_at?: string | null
  close_reason?: string | null
  realized_pnl?: number | null
}

export function createPosition(overrides: PositionOverrides = {}): Position {
  const id = overrides.id ?? idCounter++
  const direction = overrides.direction ?? 'long'
  const entry_price = overrides.entry_price ?? 98000
  const current_price = overrides.current_price ?? 98500
  const size = overrides.size ?? 0.1
  const leverage = overrides.leverage ?? 10
  const margin_used = overrides.margin_used ?? (entry_price * size) / leverage

  const unrealized_pnl =
    overrides.unrealized_pnl ??
    (current_price
      ? (current_price - entry_price) * size * (direction === 'long' ? 1 : -1)
      : null)

  const pnl_percent =
    overrides.pnl_percent ??
    (unrealized_pnl && margin_used ? (unrealized_pnl / margin_used) * 100 : 0)

  return {
    id,
    symbol: overrides.symbol ?? 'BTC',
    direction,
    size,
    entry_price,
    current_price,
    leverage,
    margin_used,
    unrealized_pnl,
    pnl_percent,
    status: overrides.status ?? 'open',
    stop_loss_price: overrides.stop_loss_price ?? 97000,
    take_profit_price: overrides.take_profit_price ?? 100000,
    risk_reward_ratio: overrides.risk_reward_ratio ?? 2.0,
    opened_at: overrides.opened_at ?? new Date().toISOString(),
    closed_at: overrides.closed_at ?? null,
    close_reason: overrides.close_reason ?? null,
    realized_pnl: overrides.realized_pnl ?? null,
  }
}

export function resetPositionIdCounter() {
  idCounter = 1
}
