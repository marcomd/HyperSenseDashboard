import { Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface HeaderProps {
  wsConnected: boolean;
  paperTrading: boolean;
  tradingAllowed: boolean;
}

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/decisions', label: 'Decisions' },
  { to: '/macro-strategies', label: 'Strategies' },
  { to: '/forecasts', label: 'Forecasts' },
  { to: '/market-snapshots', label: 'Snapshots' },
];

export function Header({ wsConnected, paperTrading, tradingAllowed }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="bg-bg-secondary border-b border-slate-700/50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="w-8 h-8 text-accent" />
            <h1 className="text-xl font-bold text-white">HyperSense</h1>
          </Link>
          <span className="text-sm text-slate-400 hidden sm:inline">Autonomous Trading Agent</span>
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

      {/* Navigation Bar */}
      <nav className="px-6 py-2 border-t border-slate-700/30 bg-bg-secondary/50">
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded transition-colors',
                  isActive
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
