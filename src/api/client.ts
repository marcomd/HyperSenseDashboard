import type {
  DashboardData,
  Position,
  TradingDecision,
  MacroStrategy,
  MarketAsset,
  PerformanceData,
  OHLCData,
  PaginationMeta,
  ListFilterParams,
  MarketSnapshot,
  ForecastListItem,
  ExecutionLog,
  ExecutionLogsStats,
  CostsSummaryResponse,
  CostsLLMResponse,
  CostsTradingResponse,
} from '@/types';

const API_BASE = '/api/v1';

// Health check response type
export interface HealthResponse {
  status: string;
  version: string;
  ruby_version: string;
  rails_version: string;
  environment: string;
  timestamp: string;
}

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

// Health API
export const healthApi = {
  getHealth: () => fetchApi<HealthResponse>('/health'),
};

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
      summary: {
        count: number;
        total_pnl: number;
        gross_pnl: number;
        total_fees: number;
        net_pnl: number;
        total_margin: number;
      };
    }>('/positions/open'),

  getById: (id: number) =>
    fetchApi<{ position: Position }>(`/positions/${id}`),

  getPerformance: (days?: number) =>
    fetchApi<PerformanceData>(`/positions/performance${days ? `?days=${days}` : ''}`),
};

// Helper to build search params from filter object
function buildFilterParams(params?: ListFilterParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('start_date', params.startDate);
  if (params.endDate) searchParams.set('end_date', params.endDate);
  if (params.symbol) searchParams.set('symbol', params.symbol);
  if (params.status) searchParams.set('status', params.status);
  if (params.operation) searchParams.set('operation', params.operation);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.per_page) searchParams.set('per_page', params.per_page.toString());
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Decisions API
export const decisionsApi = {
  getAll: (params?: ListFilterParams) => {
    const query = buildFilterParams(params);
    return fetchApi<{ decisions: TradingDecision[]; meta: PaginationMeta }>(
      `/decisions${query}`
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
  getAll: (params?: ListFilterParams) => {
    const query = buildFilterParams(params);
    return fetchApi<{ strategies: MacroStrategy[]; meta: PaginationMeta }>(
      `/macro_strategies${query}`
    );
  },

  getCurrent: () =>
    fetchApi<{ strategy: MacroStrategy | null; needs_refresh?: boolean; message?: string }>(
      '/macro_strategies/current'
    ),

  getById: (id: number) =>
    fetchApi<{ strategy: MacroStrategy }>(`/macro_strategies/${id}`),
};

// Market Snapshots API (for list views)
export const marketSnapshotsApi = {
  getAll: (params?: ListFilterParams) => {
    const query = buildFilterParams(params);
    return fetchApi<{ snapshots: MarketSnapshot[]; meta: PaginationMeta }>(
      `/market_data/snapshots${query}`
    );
  },
};

// Forecasts API (for list views)
export const forecastsApi = {
  getAll: (params?: ListFilterParams & { timeframe?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('start_date', params.startDate);
    if (params?.endDate) searchParams.set('end_date', params.endDate);
    if (params?.symbol) searchParams.set('symbol', params.symbol);
    if (params?.timeframe) searchParams.set('timeframe', params.timeframe);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return fetchApi<{ forecasts: ForecastListItem[]; meta: PaginationMeta }>(
      `/market_data/forecasts${query ? `?${query}` : ''}`
    );
  },
};

// Helper to build execution logs filter params (uses 'log_action' to avoid Rails reserved param)
function buildExecutionLogsFilterParams(params?: ListFilterParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('start_date', params.startDate);
  if (params.endDate) searchParams.set('end_date', params.endDate);
  if (params.status) searchParams.set('status', params.status);
  // Use 'operation' field from ListFilterParams as 'log_action' for execution logs
  // (can't use 'action' as it's a reserved Rails param)
  if (params.operation) searchParams.set('log_action', params.operation);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.per_page) searchParams.set('per_page', params.per_page.toString());
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Execution Logs API
export const executionLogsApi = {
  getAll: (params?: ListFilterParams) => {
    const query = buildExecutionLogsFilterParams(params);
    return fetchApi<{ execution_logs: ExecutionLog[]; meta: PaginationMeta }>(
      `/execution_logs${query}`
    );
  },

  getById: (id: number) =>
    fetchApi<{ execution_log: ExecutionLog }>(`/execution_logs/${id}`),

  getStats: (hours?: number) =>
    fetchApi<ExecutionLogsStats>(
      `/execution_logs/stats${hours ? `?hours=${hours}` : ''}`
    ),
};

// Costs API
export const costsApi = {
  getSummary: (period: 'today' | 'week' | 'month' | 'all' = 'today') =>
    fetchApi<CostsSummaryResponse>(`/costs/summary?period=${period}`),

  getLLM: () => fetchApi<CostsLLMResponse>('/costs/llm'),

  getTrading: () => fetchApi<CostsTradingResponse>('/costs/trading'),
};

// Export all APIs
export const api = {
  health: healthApi,
  dashboard: dashboardApi,
  positions: positionsApi,
  decisions: decisionsApi,
  marketData: marketDataApi,
  macroStrategies: macroStrategiesApi,
  marketSnapshots: marketSnapshotsApi,
  forecasts: forecastsApi,
  executionLogs: executionLogsApi,
  costs: costsApi,
};

export default api;
