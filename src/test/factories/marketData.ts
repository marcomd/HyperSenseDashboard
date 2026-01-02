import type {
  MarketOverview,
  MarketAsset,
  Bias,
  RsiSignal,
  MacdSignal,
} from '@/types'

interface MarketOverviewOverrides {
  price?: number
  rsi?: number | null
  rsi_signal?: RsiSignal | null
  macd_signal?: MacdSignal | null
  above_ema_50?: boolean | null
  above_ema_200?: boolean | null
  forecast_direction?: Bias | null
  forecast_change_pct?: number | null
  updated_at?: string
}

export function createMarketOverview(
  overrides: MarketOverviewOverrides = {}
): MarketOverview {
  return {
    price: overrides.price ?? 98500,
    rsi: overrides.rsi ?? 55,
    rsi_signal: overrides.rsi_signal ?? 'neutral',
    macd_signal: overrides.macd_signal ?? 'bullish',
    above_ema_50: 'above_ema_50' in overrides ? overrides.above_ema_50 : true,
    above_ema_200: 'above_ema_200' in overrides ? overrides.above_ema_200 : true,
    forecast_direction: overrides.forecast_direction ?? 'bullish',
    forecast_change_pct: overrides.forecast_change_pct ?? 2.5,
    updated_at: overrides.updated_at ?? new Date().toISOString(),
  }
}

interface MarketAssetOverrides {
  symbol?: string
  price?: number
  rsi_14?: number | null
  rsi_signal?: RsiSignal | null
  macd_signal?: MacdSignal | null
  ema_20?: number | null
  ema_50?: number | null
  ema_100?: number | null
  ema_200?: number | null
  above_ema_20?: boolean | null
  above_ema_50?: boolean | null
  above_ema_200?: boolean | null
  captured_at?: string
}

export function createMarketAsset(
  overrides: MarketAssetOverrides = {}
): MarketAsset {
  return {
    symbol: overrides.symbol ?? 'BTC',
    price: overrides.price ?? 98500,
    rsi_14: overrides.rsi_14 ?? 55,
    rsi_signal: overrides.rsi_signal ?? 'neutral',
    macd_signal: overrides.macd_signal ?? 'bullish',
    ema_20: overrides.ema_20 ?? 97000,
    ema_50: overrides.ema_50 ?? 95000,
    ema_100: overrides.ema_100 ?? 92000,
    ema_200: overrides.ema_200 ?? 90000,
    above_ema_20: overrides.above_ema_20 ?? true,
    above_ema_50: overrides.above_ema_50 ?? true,
    above_ema_200: overrides.above_ema_200 ?? true,
    captured_at: overrides.captured_at ?? new Date().toISOString(),
  }
}

export function createMarketOverviewMap(): Record<string, MarketOverview | null> {
  return {
    BTC: createMarketOverview({ price: 98500 }),
    ETH: createMarketOverview({
      price: 3450,
      rsi: 62,
      forecast_direction: 'bullish',
      forecast_change_pct: 3.2,
    }),
    SOL: createMarketOverview({
      price: 185,
      rsi: 48,
      macd_signal: 'bearish',
      forecast_direction: 'neutral',
      forecast_change_pct: 0.5,
    }),
  }
}
