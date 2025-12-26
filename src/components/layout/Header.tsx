import { Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface HeaderProps {
  wsConnected: boolean;
  paperTrading: boolean;
  tradingAllowed: boolean;
}

export function Header({ wsConnected, paperTrading, tradingAllowed }: HeaderProps) {
  return (
    <header className="bg-bg-secondary border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-accent" />
            <h1 className="text-xl font-bold text-white">HyperSense</h1>
          </div>
          <span className="text-sm text-slate-400">Autonomous Trading Agent</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Paper Trading Badge */}
          {paperTrading && (
            <div className="badge bg-yellow-500/20 text-yellow-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Paper Trading
            </div>
          )}

          {/* Trading Status */}
          <div
            className={clsx(
              'badge',
              tradingAllowed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}
          >
            <span
              className={clsx(
                'status-dot mr-2',
                tradingAllowed ? 'status-dot-success' : 'status-dot-error'
              )}
            />
            {tradingAllowed ? 'Trading Active' : 'Trading Halted'}
          </div>

          {/* WebSocket Status */}
          <div
            className={clsx(
              'flex items-center gap-1 text-sm',
              wsConnected ? 'text-green-400' : 'text-red-400'
            )}
          >
            {wsConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
