import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useTradingStatus } from '@/contexts/TradingStatusContext';

type WsStatus = 'connected' | 'disconnected' | 'not-needed';

interface FooterProps {
  /** WebSocket connection status */
  wsStatus?: WsStatus;
  /** Callback when refresh button is clicked */
  onRefresh?: () => void;
}

/**
 * Application footer displaying version info, environment, and connection status.
 */
export function Footer({ wsStatus = 'not-needed', onRefresh }: FooterProps) {
  const { backendVersion, frontendVersion, environment } = useTradingStatus();

  return (
    <footer className="bg-bg-secondary border-t border-slate-700/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <span>HyperSense</span>
          <span className="text-slate-500">|</span>
          <span>Backend v{backendVersion}</span>
          {environment && environment !== 'production' && (
            <>
              <span className="text-slate-500">|</span>
              <span className="text-yellow-500">{environment}</span>
            </>
          )}
          <span className="text-slate-500">|</span>
          <span>Frontend v{frontendVersion}</span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={clsx(
              'flex items-center gap-1',
              wsStatus === 'connected' && 'text-green-400',
              wsStatus === 'disconnected' && 'text-red-400',
              wsStatus === 'not-needed' && 'text-slate-400'
            )}
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                wsStatus === 'connected' && 'bg-green-400',
                wsStatus === 'disconnected' && 'bg-red-400',
                wsStatus === 'not-needed' && 'bg-slate-500'
              )}
            />
            {wsStatus === 'connected' && 'Real-time'}
            {wsStatus === 'disconnected' && 'Offline'}
            {wsStatus === 'not-needed' && 'Polling'}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
