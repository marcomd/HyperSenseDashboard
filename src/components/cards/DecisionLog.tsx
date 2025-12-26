import {
  ArrowUp,
  ArrowDown,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import type { TradingDecision } from '@/types';

interface DecisionLogProps {
  decisions: TradingDecision[];
  title?: string;
}

export function DecisionLog({ decisions, title = 'Recent Decisions' }: DecisionLogProps) {
  if (decisions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-slate-400">
            No recent decisions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="card-body space-y-3">
        {decisions.map((decision) => (
          <DecisionItem key={decision.id} decision={decision} />
        ))}
      </div>
    </div>
  );
}

function DecisionItem({ decision }: { decision: TradingDecision }) {
  const OperationIcon = {
    open: decision.direction === 'long' ? ArrowUp : ArrowDown,
    close: decision.direction === 'long' ? ArrowDown : ArrowUp,
    hold: Pause,
  }[decision.operation];

  const StatusIcon = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    executed: CheckCircle,
    failed: XCircle,
  }[decision.status];

  const statusColor = {
    pending: 'text-yellow-400',
    approved: 'text-blue-400',
    rejected: 'text-red-400',
    executed: 'text-green-400',
    failed: 'text-red-400',
  }[decision.status];

  const operationColor =
    decision.operation === 'hold'
      ? 'text-slate-400'
      : decision.direction === 'long'
      ? 'text-green-400'
      : 'text-red-400';

  const createdAt = new Date(decision.created_at);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div className="bg-bg-tertiary/50 rounded-lg p-3 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Operation Icon */}
        <div
          className={clsx(
            'p-2 rounded-lg',
            decision.operation === 'hold'
              ? 'bg-slate-500/20'
              : decision.direction === 'long'
              ? 'bg-green-500/20'
              : 'bg-red-500/20'
          )}
        >
          <OperationIcon className={clsx('w-4 h-4', operationColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{decision.symbol}</span>
            <span className={clsx('text-sm capitalize', operationColor)}>
              {decision.operation}
              {decision.direction && ` ${decision.direction}`}
            </span>
            {decision.confidence !== null && (
              <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                {(decision.confidence * 100).toFixed(0)}% conf
              </span>
            )}
          </div>

          {/* Reasoning */}
          {decision.reasoning && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {decision.reasoning}
            </p>
          )}

          {/* Rejection reason */}
          {decision.rejection_reason && (
            <p className="text-sm text-red-400 mt-1">
              Rejected: {decision.rejection_reason}
            </p>
          )}
        </div>

        {/* Status and Time */}
        <div className="flex flex-col items-end gap-1">
          <div className={clsx('flex items-center gap-1 text-xs', statusColor)}>
            <StatusIcon className="w-3 h-3" />
            <span className="capitalize">{decision.status}</span>
          </div>
          <span className="text-xs text-slate-500">{timeAgo}</span>
        </div>
      </div>
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
