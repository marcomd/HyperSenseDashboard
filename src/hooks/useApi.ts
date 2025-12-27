import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/api/client';
import type { HealthResponse } from '@/api/client';
import { useDashboardChannel } from './useWebSocket';
import type {
  DashboardData,
  Position,
  TradingDecision,
  MacroStrategy,
  MarketOverview,
} from '@/types';

import type { ListFilterParams } from '@/types';

// Query keys
export const queryKeys = {
  health: ['health'] as const,
  dashboard: ['dashboard'] as const,
  positions: {
    all: ['positions'] as const,
    open: ['positions', 'open'] as const,
    byId: (id: number) => ['positions', id] as const,
    performance: (days?: number) => ['positions', 'performance', days] as const,
  },
  decisions: {
    all: ['decisions'] as const,
    list: (params?: ListFilterParams) => ['decisions', 'list', params] as const,
    recent: (limit?: number) => ['decisions', 'recent', limit] as const,
    byId: (id: number) => ['decisions', id] as const,
    stats: (hours?: number) => ['decisions', 'stats', hours] as const,
  },
  marketData: {
    current: ['marketData', 'current'] as const,
    bySymbol: (symbol: string) => ['marketData', symbol] as const,
    history: (symbol: string, hours?: number, interval?: string) =>
      ['marketData', symbol, 'history', hours, interval] as const,
    forecasts: ['marketData', 'forecasts'] as const,
  },
  marketSnapshots: {
    list: (params?: ListFilterParams) => ['marketSnapshots', 'list', params] as const,
  },
  forecasts: {
    list: (params?: ListFilterParams & { timeframe?: string }) => ['forecasts', 'list', params] as const,
  },
  macroStrategy: {
    current: ['macroStrategy', 'current'] as const,
    all: ['macroStrategy'] as const,
    list: (params?: ListFilterParams) => ['macroStrategy', 'list', params] as const,
    byId: (id: number) => ['macroStrategy', id] as const,
  },
};

// Health hook - fetches backend version info
export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: queryKeys.health,
    queryFn: api.health.getHealth,
    staleTime: 60000, // Consider fresh for 1 minute
    retry: 2,
  });
}

// Dashboard hook with real-time updates
export function useDashboard() {
  const queryClient = useQueryClient();
  const { on, connected } = useDashboardChannel();

  const query = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: api.dashboard.getDashboard,
    refetchInterval: 30000, // Fallback polling every 30s
  });

  // Handle real-time updates
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Market updates
    unsubscribes.push(
      on<Record<string, MarketOverview | null>>('market_update', (message) => {
        queryClient.setQueryData<DashboardData>(queryKeys.dashboard, (old) => {
          if (!old) return old;
          return {
            ...old,
            market: {
              ...old.market,
              ...message.data,
            },
          };
        });
      })
    );

    // Position updates
    unsubscribes.push(
      on<Position>('position_update', () => {
        // Invalidate positions to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.positions.open });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      })
    );

    // Decision updates
    unsubscribes.push(
      on<TradingDecision>('decision_update', (message) => {
        queryClient.setQueryData<DashboardData>(queryKeys.dashboard, (old) => {
          if (!old) return old;
          const newDecision = message.data;
          return {
            ...old,
            recent_decisions: [
              newDecision,
              ...old.recent_decisions.slice(0, 4),
            ],
          };
        });
      })
    );

    // Macro strategy updates
    unsubscribes.push(
      on<MacroStrategy>('macro_strategy_update', (message) => {
        queryClient.setQueryData<DashboardData>(queryKeys.dashboard, (old) => {
          if (!old) return old;
          return {
            ...old,
            macro_strategy: message.data,
          };
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.macroStrategy.current });
      })
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [on, queryClient]);

  return { ...query, wsConnected: connected };
}

// Positions hooks
export function useOpenPositions() {
  return useQuery({
    queryKey: queryKeys.positions.open,
    queryFn: api.positions.getOpen,
    refetchInterval: 15000,
  });
}

export function usePositions(params?: Parameters<typeof api.positions.getAll>[0]) {
  return useQuery({
    queryKey: [...queryKeys.positions.all, params],
    queryFn: () => api.positions.getAll(params),
  });
}

export function usePosition(id: number) {
  return useQuery({
    queryKey: queryKeys.positions.byId(id),
    queryFn: () => api.positions.getById(id),
  });
}

export function usePerformance(days = 30) {
  return useQuery({
    queryKey: queryKeys.positions.performance(days),
    queryFn: () => api.positions.getPerformance(days),
  });
}

// Decisions hooks
export function useRecentDecisions(limit = 20) {
  return useQuery({
    queryKey: queryKeys.decisions.recent(limit),
    queryFn: () => api.decisions.getRecent(limit),
    refetchInterval: 30000,
  });
}

export function useDecisions(params?: Parameters<typeof api.decisions.getAll>[0]) {
  return useQuery({
    queryKey: [...queryKeys.decisions.all, params],
    queryFn: () => api.decisions.getAll(params),
  });
}

export function useDecisionStats(hours = 24) {
  return useQuery({
    queryKey: queryKeys.decisions.stats(hours),
    queryFn: () => api.decisions.getStats(hours),
  });
}

// Market data hooks
export function useCurrentMarketData() {
  return useQuery({
    queryKey: queryKeys.marketData.current,
    queryFn: api.marketData.getCurrent,
    refetchInterval: 60000,
  });
}

export function useMarketDataBySymbol(symbol: string) {
  return useQuery({
    queryKey: queryKeys.marketData.bySymbol(symbol),
    queryFn: () => api.marketData.getBySymbol(symbol),
    enabled: !!symbol,
  });
}

export function usePriceHistory(symbol: string, hours = 24, interval = '5m') {
  return useQuery({
    queryKey: queryKeys.marketData.history(symbol, hours, interval),
    queryFn: () => api.marketData.getHistory(symbol, { hours, interval }),
    enabled: !!symbol,
  });
}

export function useForecasts() {
  return useQuery({
    queryKey: queryKeys.marketData.forecasts,
    queryFn: api.marketData.getForecasts,
    refetchInterval: 300000, // 5 minutes
  });
}

// Macro strategy hooks
export function useCurrentMacroStrategy() {
  return useQuery({
    queryKey: queryKeys.macroStrategy.current,
    queryFn: api.macroStrategies.getCurrent,
    refetchInterval: 60000,
  });
}

export function useMacroStrategies(params?: Parameters<typeof api.macroStrategies.getAll>[0]) {
  return useQuery({
    queryKey: [...queryKeys.macroStrategy.all, params],
    queryFn: () => api.macroStrategies.getAll(params),
  });
}

// List hooks for detail pages
export function useDecisionsList(params?: ListFilterParams) {
  return useQuery({
    queryKey: queryKeys.decisions.list(params),
    queryFn: () => api.decisions.getAll(params),
  });
}

export function useMacroStrategiesList(params?: ListFilterParams) {
  return useQuery({
    queryKey: queryKeys.macroStrategy.list(params),
    queryFn: () => api.macroStrategies.getAll(params),
  });
}

export function useMarketSnapshotsList(params?: ListFilterParams) {
  return useQuery({
    queryKey: queryKeys.marketSnapshots.list(params),
    queryFn: () => api.marketSnapshots.getAll(params),
  });
}

export function useForecastsList(params?: ListFilterParams & { timeframe?: string }) {
  return useQuery({
    queryKey: queryKeys.forecasts.list(params),
    queryFn: () => api.forecasts.getAll(params),
  });
}
