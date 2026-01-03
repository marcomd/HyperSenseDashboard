import { useState } from 'react';
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
