import type { MarketSnapshot } from '@/types'

let idCounter = 1

interface MarketSnapshotOverrides {
  id?: number
  symbol?: string
  price?: number
  indicators?: MarketSnapshot['indicators']
  sentiment?: MarketSnapshot['sentiment']
  captured_at?: string
}

export function createMarketSnapshot(overrides: MarketSnapshotOverrides = {}): MarketSnapshot {
  const id = overrides.id ?? idCounter++
  const symbol = overrides.symbol ?? 'BTC'
  const basePrice = symbol === 'BTC' ? 98500 : symbol === 'ETH' ? 3450 : 185

  return {
    id,
    symbol,
    price: overrides.price ?? basePrice,
    indicators: overrides.indicators ?? {
      rsi_14: 55.5,
      ema_20: basePrice * 0.99,
      ema_50: basePrice * 0.98,
      ema_100: basePrice * 0.97,
      macd: {
        value: 50,
        signal: 45,
        histogram: 5,
      },
    },
    sentiment: overrides.sentiment ?? null,
    captured_at: overrides.captured_at ?? new Date().toISOString(),
  }
}

export function resetMarketSnapshotIdCounter() {
  idCounter = 1
}
