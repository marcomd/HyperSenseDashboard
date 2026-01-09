/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { HealthResponse } from '@/api/client';
import { queryKeys } from '@/hooks/useApi';
import type { TradingModeName } from '@/types';

/**
 * Trading status shared across all pages.
 * Provides paper_trading, trading mode status, and version info.
 */
interface TradingStatus {
  /** Whether paper trading mode is enabled */
  paperTrading: boolean;
  /** Whether any trading is allowed (can open or close positions) */
  tradingAllowed: boolean;
  /** Current trading mode: enabled, exit_only, or blocked */
  tradingMode: TradingModeName;
  /** Whether new positions can be opened */
  canOpenPositions: boolean;
  /** Whether positions can be closed */
  canClosePositions: boolean;
  /** Backend version string */
  backendVersion: string;
  /** Frontend version string */
  frontendVersion: string;
  /** Backend environment (development, production, etc.) */
  environment: string;
  /** Whether the status data is still loading */
  isLoading: boolean;
}

const TradingStatusContext = createContext<TradingStatus | null>(null);

// Frontend version injected by Vite
declare const __APP_VERSION__: string;

interface TradingStatusProviderProps {
  children: ReactNode;
}

/**
 * Provider that fetches and shares trading status across the app.
 * All status data comes from the /health endpoint (single source of truth).
 */
export function TradingStatusProvider({ children }: TradingStatusProviderProps) {
  const { data: healthData, isLoading } = useQuery<HealthResponse>({
    queryKey: queryKeys.health,
    queryFn: api.health.getHealth,
    staleTime: 30000,
    refetchInterval: 30000,
    retry: 2,
  });

  const value = useMemo<TradingStatus>(() => ({
    paperTrading: healthData?.paper_trading ?? false,
    tradingAllowed: healthData?.trading_allowed ?? true,
    tradingMode: healthData?.trading_mode ?? 'enabled',
    canOpenPositions: healthData?.can_open_positions ?? true,
    canClosePositions: healthData?.can_close_positions ?? true,
    backendVersion: healthData?.version ?? '...',
    frontendVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '...',
    environment: healthData?.environment ?? 'unknown',
    isLoading,
  }), [healthData, isLoading]);

  return (
    <TradingStatusContext.Provider value={value}>
      {children}
    </TradingStatusContext.Provider>
  );
}

/**
 * Hook to access trading status from any component.
 * Must be used within a TradingStatusProvider.
 */
export function useTradingStatus(): TradingStatus {
  const context = useContext(TradingStatusContext);
  if (!context) {
    throw new Error('useTradingStatus must be used within a TradingStatusProvider');
  }
  return context;
}
