import type { ForecastListItem, Bias } from '@/types'

let idCounter = 1

interface ForecastListItemOverrides {
  id?: number
  symbol?: string
  timeframe?: string
  current_price?: number
  predicted_price?: number
  direction?: Bias
  change_pct?: number
  forecast_for?: string
  actual_price?: number | null
  mae?: number | null
  mape?: number | null
  created_at?: string
}

export function createForecastListItem(overrides: ForecastListItemOverrides = {}): ForecastListItem {
  const id = overrides.id ?? idCounter++
  const symbol = overrides.symbol ?? 'BTC'
  const basePrice = symbol === 'BTC' ? 98500 : symbol === 'ETH' ? 3450 : 185
  const current_price = overrides.current_price ?? basePrice
  const direction = overrides.direction ?? 'bullish'
  const change_pct = overrides.change_pct ?? (direction === 'bullish' ? 0.5 : direction === 'bearish' ? -0.5 : 0)
  const predicted_price = overrides.predicted_price ?? current_price * (1 + change_pct / 100)

  return {
    id,
    symbol,
    timeframe: overrides.timeframe ?? '1h',
    current_price,
    predicted_price,
    direction,
    change_pct,
    forecast_for: overrides.forecast_for ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    actual_price: overrides.actual_price ?? null,
    mae: overrides.mae ?? null,
    mape: overrides.mape ?? null,
    created_at: overrides.created_at ?? new Date().toISOString(),
  }
}

export function resetForecastIdCounter() {
  idCounter = 1
}
