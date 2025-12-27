import type { MacroStrategy, Bias } from '@/types'

let idCounter = 1

interface MacroStrategyOverrides {
  id?: number
  bias?: Bias
  risk_tolerance?: number
  market_narrative?: string
  key_levels?: Record<string, { support: number[]; resistance: number[] }>
  valid_until?: string
  created_at?: string
  stale?: boolean
}

export function createMacroStrategy(
  overrides: MacroStrategyOverrides = {}
): MacroStrategy {
  const id = overrides.id ?? idCounter++

  return {
    id,
    bias: overrides.bias ?? 'bullish',
    risk_tolerance: overrides.risk_tolerance ?? 0.7,
    market_narrative:
      overrides.market_narrative ??
      'Bitcoin showing strength above key EMA levels with positive momentum indicators. Market sentiment remains optimistic with institutional accumulation continuing.',
    key_levels: overrides.key_levels ?? {
      BTC: {
        support: [95000, 92000, 88000],
        resistance: [100000, 105000, 110000],
      },
      ETH: {
        support: [3200, 3000, 2800],
        resistance: [3600, 3800, 4000],
      },
    },
    valid_until:
      overrides.valid_until ??
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: overrides.created_at ?? new Date().toISOString(),
    stale: overrides.stale ?? false,
  }
}

export function resetMacroStrategyIdCounter() {
  idCounter = 1
}
