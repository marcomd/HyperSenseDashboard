import { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import clsx from 'clsx';
import type { TradingDecision, PositionSummary } from '@/types';
import { VolatilityBadge } from '@/components/common/VolatilityBadge';

interface DecisionLogProps {
  decisions: TradingDecision[];
  title?: string;
}

/**
 * Displays a list of recent trading decisions with expandable reasoning text.
 * Each decision item shows operation, symbol, confidence, status, and time.
 * Truncated reasoning can be expanded by clicking "show more".
 */
export function DecisionLog({ decisions, title = 'Recent Decisions' }: DecisionLogProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  /**
   * Toggles the expanded state of a decision's reasoning text.
   * @param id - The decision ID to toggle
   */
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
          <DecisionItem
            key={decision.id}
            decision={decision}
            isExpanded={expandedIds.has(decision.id)}
            onToggleExpand={() => toggleExpanded(decision.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface DecisionItemProps {
  decision: TradingDecision;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Renders a single decision item with expandable reasoning text.
 * Shows operation icon, symbol, confidence, status, time, and reasoning.
 */
function DecisionItem({ decision, isExpanded, onToggleExpand }: DecisionItemProps) {
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
    <div className="bg-bg-tertiary/50 rounded-lg p-2 sm:p-3 animate-fade-in">
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Operation Icon */}
        <div
          className={clsx(
            'p-1.5 sm:p-2 rounded-lg flex-shrink-0',
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
          {/* First row: metadata badges + status/time on mobile */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-medium text-white">{decision.symbol}</span>
              <span className={clsx('text-sm capitalize', operationColor)}>
                {decision.operation}
                {decision.direction && ` ${decision.direction}`}
              </span>
              {decision.confidence !== null && (
                <span className="text-xs text-slate-400 bg-slate-700/50 px-1.5 sm:px-2 py-0.5 rounded">
                  {(decision.confidence * 100).toFixed(0)}%
                </span>
              )}
              {decision.volatility_level && (
                <VolatilityBadge level={decision.volatility_level} size="sm" />
              )}
              {decision.risk_profile_name && (
                <span
                  className={clsx(
                    'hidden sm:inline text-xs px-2 py-0.5 rounded capitalize',
                    decision.risk_profile_name === 'cautious' && 'text-blue-400 bg-blue-500/20',
                    decision.risk_profile_name === 'moderate' && 'text-slate-400 bg-slate-700/50',
                    decision.risk_profile_name === 'fearless' && 'text-orange-400 bg-orange-500/20'
                  )}
                >
                  {decision.risk_profile_name}
                </span>
              )}
              {decision.llm_model && (
                <span className="hidden sm:inline text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                  {decision.llm_model}
                </span>
              )}
            </div>

            {/* Status and Time - inline on mobile */}
            <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0 text-xs">
              <div className={clsx('flex items-center gap-1', statusColor)}>
                <StatusIcon className="w-3 h-3" />
                <span className="capitalize">{decision.status}</span>
              </div>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">{timeAgo}</span>
            </div>
          </div>

          {/* Position P&L (when decision has a linked position) */}
          {decision.position && (
            <PositionPnLDisplay position={decision.position} />
          )}

          {/* Reasoning with expand/collapse */}
          {decision.reasoning && (
            <ExpandableText
              text={decision.reasoning}
              isExpanded={isExpanded}
              onToggle={onToggleExpand}
            />
          )}

          {/* Rejection reason */}
          {decision.rejection_reason && (
            <p className="text-sm text-red-400 mt-1">
              Rejected: {decision.rejection_reason}
            </p>
          )}
        </div>

        {/* Status and Time - desktop only */}
        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
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

/** Threshold in characters before text is truncated. */
const TRUNCATE_LENGTH = 180;

interface ExpandableTextProps {
  text: string;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Displays text that can be expanded/collapsed if it exceeds the truncation threshold.
 * Shows a "show more" / "show less" button when text is truncatable.
 */
function ExpandableText({ text, isExpanded, onToggle }: ExpandableTextProps) {
  const isTruncatable = text.length > TRUNCATE_LENGTH;
  const displayText = isExpanded || !isTruncatable
    ? text
    : text.slice(0, TRUNCATE_LENGTH);

  return (
    <p className="text-sm text-slate-400 mt-1">
      {displayText}
      {isTruncatable && (
        <button
          onClick={onToggle}
          className="ml-1 text-accent hover:text-accent-hover transition-colors"
        >
          {isExpanded ? 'show less' : '...show more'}
        </button>
      )}
    </p>
  );
}

export interface PositionPnLDisplayProps {
  position: PositionSummary;
}

/**
 * Displays P&L information for a decision's linked position.
 * Shows entry price, current/realized P&L, and win/loss outcome for closed positions.
 */
export function PositionPnLDisplay({ position }: PositionPnLDisplayProps) {
  const isOpen = position.status === 'open';
  const isClosed = position.status === 'closed';

  // Determine P&L value and percentage
  const pnl = isClosed ? position.realized_pnl : position.unrealized_pnl;
  const pnlPercent = position.pnl_percent;
  const isPositive = pnl !== null && pnl > 0;
  const isNegative = pnl !== null && pnl < 0;

  // Format P&L with sign
  const formatPnL = (value: number | null): string => {
    if (value === null) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${value.toFixed(2)}`;
  };

  // Format percentage with sign
  const formatPercent = (value: number | null): string => {
    if (value === null) return '';
    const sign = value >= 0 ? '+' : '';
    return `(${sign}${value.toFixed(2)}%)`;
  };

  // Outcome icon for closed positions
  const OutcomeIcon = position.outcome === 'win'
    ? TrendingUp
    : position.outcome === 'loss'
    ? TrendingDown
    : Minus;

  const outcomeColor = position.outcome === 'win'
    ? 'text-green-400'
    : position.outcome === 'loss'
    ? 'text-red-400'
    : 'text-slate-400';

  return (
    <div className="flex items-center gap-2 mt-1.5 text-xs">
      {/* Entry price */}
      {position.entry_price && (
        <span className="text-slate-500">
          @ ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )}

      {/* P&L value */}
      {pnl !== null && (
        <span
          className={clsx(
            'font-medium',
            isPositive && 'text-green-400',
            isNegative && 'text-red-400',
            !isPositive && !isNegative && 'text-slate-400'
          )}
        >
          {formatPnL(pnl)} {formatPercent(pnlPercent)}
        </span>
      )}

      {/* Outcome badge for closed positions */}
      {isClosed && position.outcome && (
        <span
          className={clsx(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium',
            position.outcome === 'win' && 'bg-green-500/20 text-green-400',
            position.outcome === 'loss' && 'bg-red-500/20 text-red-400',
            position.outcome === 'breakeven' && 'bg-slate-700/50 text-slate-400'
          )}
        >
          <OutcomeIcon className={clsx('w-3 h-3', outcomeColor)} />
          <span className="capitalize">{position.outcome}</span>
        </span>
      )}

      {/* Open position indicator */}
      {isOpen && (
        <span className="text-xs text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
          Open
        </span>
      )}
    </div>
  );
}
