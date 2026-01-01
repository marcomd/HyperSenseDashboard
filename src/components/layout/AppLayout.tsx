import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTradingStatus } from '@/contexts/TradingStatusContext';

type WsStatus = 'connected' | 'disconnected' | 'not-needed';

interface AppLayoutProps {
  children: ReactNode;
  /** WebSocket connection status (only Dashboard has real-time) */
  wsStatus?: WsStatus;
  /** Callback when refresh button is clicked */
  onRefresh?: () => void;
}

/**
 * Main application layout wrapper.
 * Provides consistent Header and Footer across all pages.
 * Must be used within a TradingStatusProvider (set up in App.tsx).
 */
export function AppLayout({ children, wsStatus = 'not-needed', onRefresh }: AppLayoutProps) {
  const { paperTrading, tradingAllowed } = useTradingStatus();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header
        wsStatus={wsStatus}
        paperTrading={paperTrading}
        tradingAllowed={tradingAllowed}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer wsStatus={wsStatus} onRefresh={onRefresh} />
    </div>
  );
}
