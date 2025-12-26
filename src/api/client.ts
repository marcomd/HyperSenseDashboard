import type {
  DashboardData,
  Position,
  TradingDecision,
  MacroStrategy,
  MarketAsset,
  PerformanceData,
  OHLCData,
  PaginationMeta,
} from '@/types';

const API_BASE = '/api/v1';

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardApi = {
  getDashboard: () =>
    fetchApi<DashboardData>('/dashboard'),

  getAccount: () =>
    fetchApi<{ account: DashboardData['account'] }>('/dashboard/account'),

  getSystemStatus: () =>
    fetchApi<{ system: DashboardData['system_status'] }>('/dashboard/system_status'),
};

// Positions API
export const positionsApi = {
  getAll: (params?: { status?: string; symbol?: string; page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.symbol) searchParams.set('symbol', params.symbol);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return fetchApi<{ positions: Position[]; meta: PaginationMeta }>(
      `/positions${query ? `?${query}` : ''}`
    );
  },

  getOpen: () =>
    fetchApi<{
      positions: Position[];
      summary: { count: number; total_pnl: number; total_margin: number };
    }>('/positions/open'),

  getById: (id: number) =>
    fetchApi<{ position: Position }>(`/positions/${id}`),

  getPerformance: (days?: number) =>
    fetchApi<PerformanceData>(`/positions/performance${days ? `?days=${days}` : ''}`),
};

// Decisions API
export const decisionsApi = {
  getAll: (params?: {
    status?: string;
    symbol?: string;
    operation?: string;
    page?: number;
    per_page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.symbol) searchParams.set('symbol', params.symbol);
    if (params?.operation) searchParams.set('operation', params.operation);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return fetchApi<{ decisions: TradingDecision[]; meta: PaginationMeta }>(
      `/decisions${query ? `?${query}` : ''}`
    );
  },

  getRecent: (limit?: number) =>
    fetchApi<{ decisions: TradingDecision[] }>(
      `/decisions/recent${limit ? `?limit=${limit}` : ''}`
    ),

  getById: (id: number) =>
    fetchApi<{ decision: TradingDecision }>(`/decisions/${id}`),

  getStats: (hours?: number) =>
    fetchApi<{
      period_hours: number;
      total_decisions: number;
      by_status: Record<string, number>;
      by_symbol: Record<string, number>;
      by_operation: Record<string, number>;
      average_confidence: number | null;
      execution_rate: number;
      rejection_reasons: Record<string, number>;
    }>(`/decisions/stats${hours ? `?hours=${hours}` : ''}`),
};

// Market Data API
export const marketDataApi = {
  getCurrent: () =>
    fetchApi<{ assets: MarketAsset[]; updated_at: string | null }>('/market_data/current'),

  getBySymbol: (symbol: string) =>
    fetchApi<{ asset: MarketAsset }>(`/market_data/${symbol.toUpperCase()}`),

  getHistory: (symbol: string, params?: { hours?: number; interval?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.hours) searchParams.set('hours', params.hours.toString());
    if (params?.interval) searchParams.set('interval', params.interval);
    const query = searchParams.toString();
    return fetchApi<{ symbol: string; interval: string; data: OHLCData[] }>(
      `/market_data/${symbol.toUpperCase()}/history${query ? `?${query}` : ''}`
    );
  },

  getForecasts: () =>
    fetchApi<{
      forecasts: Record<string, Record<string, {
        current_price: number;
        predicted_price: number;
        direction: string;
        change_pct: number;
        forecast_for: string;
        created_at: string;
      } | null>>;
    }>('/market_data/forecasts'),

  getSymbolForecasts: (symbol: string) =>
    fetchApi<{
      symbol: string;
      forecasts: Record<string, {
        current_price: number;
        predicted_price: number;
        direction: string;
        change_pct: number;
        forecast_for: string;
        created_at: string;
      } | null>;
      accuracy: { avg_mape: number | null; sample_size: number };
    }>(`/market_data/${symbol.toUpperCase()}/forecasts`),
};

// Macro Strategies API
export const macroStrategiesApi = {
  getAll: (params?: { page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return fetchApi<{ strategies: MacroStrategy[]; meta: PaginationMeta }>(
      `/macro_strategies${query ? `?${query}` : ''}`
    );
  },

  getCurrent: () =>
    fetchApi<{ strategy: MacroStrategy | null; needs_refresh?: boolean; message?: string }>(
      '/macro_strategies/current'
    ),

  getById: (id: number) =>
    fetchApi<{ strategy: MacroStrategy }>(`/macro_strategies/${id}`),
};

// Export all APIs
export const api = {
  dashboard: dashboardApi,
  positions: positionsApi,
  decisions: decisionsApi,
  marketData: marketDataApi,
  macroStrategies: macroStrategiesApi,
};

export default api;
