import { Activity, Wifi, WifiOff, AlertTriangle, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Tooltip } from '@/components/common/Tooltip';

type WsStatus = 'connected' | 'disconnected' | 'not-needed';

interface HeaderProps {
  wsConnected?: boolean;
  wsStatus?: WsStatus;
  paperTrading: boolean;
  tradingAllowed: boolean;
}

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/decisions', label: 'Decisions' },
  { to: '/macro-strategies', label: 'Strategies' },
  { to: '/forecasts', label: 'Forecasts' },
  { to: '/market-snapshots', label: 'Snapshots' },
  { to: '/execution-logs', label: 'Exec Logs' },
];

export function Header({ wsConnected, wsStatus, paperTrading, tradingAllowed }: HeaderProps) {
  const location = useLocation();

  // Derive effective status: prefer explicit wsStatus, otherwise derive from boolean
  const effectiveStatus: WsStatus = wsStatus ?? (wsConnected ? 'connected' : 'disconnected');

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
          <div className="flex items-center gap-1">
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
            <Tooltip
              content={
                <div className="space-y-2">
                  <p className="font-medium">Trading Status</p>
                  <p className="text-slate-300 text-xs">
                    <span className="text-green-400 font-medium">Active:</span> The agent is monitoring
                    markets and can execute trades normally.
                  </p>
                  <p className="text-slate-300 text-xs">
                    <span className="text-red-400 font-medium">Halted:</span> Circuit breaker triggered
                    due to risk thresholds being exceeded.
                  </p>
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <p className="text-slate-400 text-xs font-medium mb-1">Circuit breaker triggers:</p>
                    <ul className="text-xs text-slate-300 space-y-0.5">
                      <li>• Daily loss exceeds 5% of account</li>
                      <li>• 3 consecutive losing trades</li>
                    </ul>
                  </div>
                  <p className="text-slate-400 text-xs italic">
                    Trading resumes after 24h cooldown.
                  </p>
                </div>
              }
              position="bottom"
            >
              <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
            </Tooltip>
          </div>

          {/* WebSocket Status */}
          <div
            className={clsx(
              'flex items-center gap-1 text-sm',
              effectiveStatus === 'connected' && 'text-green-400',
              effectiveStatus === 'disconnected' && 'text-red-400',
              effectiveStatus === 'not-needed' && 'text-orange-400'
            )}
          >
            {effectiveStatus === 'connected' ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {effectiveStatus === 'connected' && 'Connected'}
              {effectiveStatus === 'disconnected' && 'Disconnected'}
              {effectiveStatus === 'not-needed' && 'No realtime'}
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
