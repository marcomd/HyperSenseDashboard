import { CheckCircle, XCircle, AlertTriangle, Clock, Server, Brain, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import type { SystemStatus as SystemStatusType } from '@/types';

interface SystemStatusProps {
  status: SystemStatusType;
}

export function SystemStatus({ status }: SystemStatusProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">System Status</h2>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {/* Market Data */}
          <StatusItem
            icon={<BarChart3 className="w-4 h-4" />}
            label="Market Data"
            healthy={status.market_data.healthy}
            lastUpdate={status.market_data.last_update}
          />

          {/* Trading Cycle */}
          <StatusItem
            icon={<Server className="w-4 h-4" />}
            label="Trading Cycle"
            healthy={status.trading_cycle.healthy}
            lastUpdate={status.trading_cycle.last_run}
          />

          {/* Macro Strategy */}
          <StatusItem
            icon={<Brain className="w-4 h-4" />}
            label="Macro Strategy"
            healthy={status.macro_strategy.healthy}
            lastUpdate={status.macro_strategy.last_update}
            stale={status.macro_strategy.stale ?? false}
          />
        </div>

        {/* Assets Being Tracked */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="text-sm text-slate-400 mb-2">Tracked Assets</div>
          <div className="flex flex-wrap gap-2">
            {status.assets_tracked.map((asset) => (
              <span
                key={asset}
                className="badge bg-accent/20 text-accent"
              >
                {asset}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  healthy,
  lastUpdate,
  stale = false,
}: {
  icon: React.ReactNode;
  label: string;
  healthy: boolean;
  lastUpdate: string | null;
  stale?: boolean;
}) {
  const StatusIcon = healthy
    ? stale
      ? AlertTriangle
      : CheckCircle
    : XCircle;

  const statusColor = healthy
    ? stale
      ? 'text-yellow-400'
      : 'text-green-400'
    : 'text-red-400';

  const bgColor = healthy
    ? stale
      ? 'bg-yellow-500/10'
      : 'bg-green-500/10'
    : 'bg-red-500/10';

  const timeAgo = lastUpdate ? getTimeAgo(new Date(lastUpdate)) : 'Never';

  return (
    <div className={clsx('flex items-center justify-between p-3 rounded-lg', bgColor)}>
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <div>
          <div className="font-medium text-white">{label}</div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
        </div>
      </div>
      <StatusIcon className={clsx('w-5 h-5', statusColor)} />
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
