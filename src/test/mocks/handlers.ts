import { http, HttpResponse } from 'msw'
import {
  createDashboardData,
  createPosition,
  createDecision,
  createMacroStrategy,
  createPerformanceData,
  createMarketAsset,
  createMarketSnapshot,
  createForecastListItem,
} from '../factories'

export const handlers = [
  // Health endpoint
  http.get('/api/v1/health', () => {
    return HttpResponse.json({
      status: 'ok',
      version: '0.8.0',
      ruby_version: '3.4.4',
      rails_version: '8.1.1',
      environment: 'test',
      timestamp: new Date().toISOString(),
    })
  }),

  // Dashboard endpoints
  http.get('/api/v1/dashboard', () => {
    return HttpResponse.json(createDashboardData())
  }),

  http.get('/api/v1/dashboard/account', () => {
    const dashboard = createDashboardData()
    return HttpResponse.json({ account: dashboard.account })
  }),

  http.get('/api/v1/dashboard/system_status', () => {
    const dashboard = createDashboardData()
    return HttpResponse.json({ system: dashboard.system_status })
  }),

  // Positions endpoints
  http.get('/api/v1/positions', () => {
    return HttpResponse.json({
      positions: [createPosition(), createPosition({ symbol: 'ETH', direction: 'short' })],
      meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
    })
  }),

  http.get('/api/v1/positions/open', () => {
    const positions = [
      createPosition(),
      createPosition({ symbol: 'ETH', direction: 'short' }),
    ]
    return HttpResponse.json({
      positions,
      summary: { count: positions.length, total_pnl: 150.0, total_margin: 980.0 },
    })
  }),

  http.get('/api/v1/positions/:id', ({ params }) => {
    const id = Number(params.id)
    return HttpResponse.json({
      position: createPosition({ id }),
    })
  }),

  http.get('/api/v1/positions/performance', () => {
    return HttpResponse.json(createPerformanceData())
  }),

  // Decisions endpoints
  http.get('/api/v1/decisions', () => {
    return HttpResponse.json({
      decisions: [createDecision(), createDecision({ operation: 'hold', symbol: 'ETH' })],
      meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
    })
  }),

  http.get('/api/v1/decisions/recent', () => {
    return HttpResponse.json({
      decisions: [
        createDecision(),
        createDecision({ operation: 'hold', symbol: 'ETH' }),
        createDecision({ operation: 'close', status: 'rejected', rejection_reason: 'Risk limit reached' }),
      ],
    })
  }),

  http.get('/api/v1/decisions/:id', ({ params }) => {
    const id = Number(params.id)
    return HttpResponse.json({
      decision: createDecision({ id }),
    })
  }),

  http.get('/api/v1/decisions/stats', () => {
    return HttpResponse.json({
      period_hours: 24,
      total_decisions: 15,
      by_status: { executed: 10, rejected: 3, pending: 2 },
      by_symbol: { BTC: 8, ETH: 5, SOL: 2 },
      by_operation: { open: 5, close: 4, hold: 6 },
      average_confidence: 0.78,
      execution_rate: 0.67,
      rejection_reasons: { 'Risk limit': 2, 'Low confidence': 1 },
    })
  }),

  // Market Data endpoints
  http.get('/api/v1/market_data/current', () => {
    return HttpResponse.json({
      assets: [
        createMarketAsset({ symbol: 'BTC', price: 98500 }),
        createMarketAsset({ symbol: 'ETH', price: 3450 }),
        createMarketAsset({ symbol: 'SOL', price: 185 }),
      ],
      updated_at: new Date().toISOString(),
    })
  }),

  http.get('/api/v1/market_data/:symbol', ({ params }) => {
    const symbol = String(params.symbol).toUpperCase()
    return HttpResponse.json({
      asset: createMarketAsset({ symbol }),
    })
  }),

  http.get('/api/v1/market_data/:symbol/history', ({ params }) => {
    const symbol = String(params.symbol).toUpperCase()
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (24 - i) * 60 * 60 * 1000).toISOString(),
      open: 98000 + Math.random() * 1000,
      high: 98500 + Math.random() * 1000,
      low: 97500 + Math.random() * 500,
      close: 98200 + Math.random() * 800,
      volume: 1000 + Math.random() * 500,
    }))
    return HttpResponse.json({ symbol, interval: '1h', data })
  }),

  http.get('/api/v1/market_data/forecasts', ({ request }) => {
    const url = new URL(request.url)
    // If page param is present, return list format for the list page
    if (url.searchParams.has('page') || url.searchParams.has('per_page')) {
      return HttpResponse.json({
        forecasts: [
          createForecastListItem({ symbol: 'BTC', timeframe: '1h' }),
          createForecastListItem({ symbol: 'BTC', timeframe: '15m' }),
          createForecastListItem({ symbol: 'ETH', timeframe: '1h' }),
        ],
        meta: { page: 1, per_page: 25, total: 3, total_pages: 1 },
      })
    }
    // Otherwise return aggregated format for dashboard
    return HttpResponse.json({
      forecasts: {
        BTC: {
          '1h': {
            current_price: 98500,
            predicted_price: 99000,
            direction: 'bullish',
            change_pct: 0.51,
            forecast_for: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
          },
        },
        ETH: {
          '1h': {
            current_price: 3450,
            predicted_price: 3480,
            direction: 'bullish',
            change_pct: 0.87,
            forecast_for: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
          },
        },
      },
    })
  }),

  http.get('/api/v1/market_data/:symbol/forecasts', ({ params }) => {
    const symbol = String(params.symbol).toUpperCase()
    return HttpResponse.json({
      symbol,
      forecasts: {
        '1h': {
          current_price: 98500,
          predicted_price: 99000,
          direction: 'bullish',
          change_pct: 0.51,
          forecast_for: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
      },
      accuracy: { avg_mape: 2.5, sample_size: 100 },
    })
  }),

  // Macro Strategies endpoints
  http.get('/api/v1/macro_strategies', () => {
    return HttpResponse.json({
      strategies: [createMacroStrategy(), createMacroStrategy({ bias: 'neutral' })],
      meta: { page: 1, per_page: 25, total: 2, total_pages: 1 },
    })
  }),

  http.get('/api/v1/macro_strategies/current', () => {
    return HttpResponse.json({
      strategy: createMacroStrategy(),
      needs_refresh: false,
    })
  }),

  http.get('/api/v1/macro_strategies/:id', ({ params }) => {
    const id = Number(params.id)
    return HttpResponse.json({
      strategy: createMacroStrategy({ id }),
    })
  }),

  // Market Snapshots list endpoint
  http.get('/api/v1/market_data/snapshots', () => {
    return HttpResponse.json({
      snapshots: [
        createMarketSnapshot({ symbol: 'BTC' }),
        createMarketSnapshot({ symbol: 'ETH' }),
        createMarketSnapshot({ symbol: 'SOL' }),
      ],
      meta: { page: 1, per_page: 25, total: 3, total_pages: 1 },
    })
  }),

]
