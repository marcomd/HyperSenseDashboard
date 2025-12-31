import { ArrowUp, ArrowDown, Shield, Target } from 'lucide-react';
import clsx from 'clsx';
import type { Position } from '@/types';

interface PositionsTableProps {
  positions: Position[];
  title?: string;
}

export function PositionsTable({ positions, title = 'Open Positions' }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-slate-400">
            No open positions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-sm text-slate-400">{positions.length} positions</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Direction</th>
              <th>Size</th>
              <th>Entry</th>
              <th>Current</th>
              <th>PnL</th>
              <th>Leverage</th>
              <th>SL/TP</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <PositionRow key={position.id} position={position} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PositionRow({ position }: { position: Position }) {
  const isProfitable = (position.unrealized_pnl ?? 0) >= 0;
  const pnlPercent = position.pnl_percent;

  return (
    <tr className="hover:bg-slate-800/50">
      <td>
        <div className="font-medium text-white">{position.symbol}</div>
      </td>
      <td>
        <div
          className={clsx(
            'inline-flex items-center gap-1 badge',
            position.direction === 'long' ? 'badge-bullish' : 'badge-bearish'
          )}
        >
          {position.direction === 'long' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          {position.direction.toUpperCase()}
        </div>
      </td>
      <td className="text-white font-mono">
        {position.size.toFixed(4)}
      </td>
      <td className="text-slate-300 font-mono">
        ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="text-white font-mono">
        {position.current_price
          ? `$${position.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '-'}
      </td>
      <td>
        <div className="flex flex-col">
          <span
            className={clsx(
              'font-mono font-medium',
              isProfitable ? 'text-green-400' : 'text-red-400'
            )}
          >
            {isProfitable ? '+' : ''}
            ${(position.unrealized_pnl ?? 0).toFixed(2)}
          </span>
          {position.fees && (
            <span className="text-xs text-slate-500">
              Net: ${position.fees.net_pnl.toFixed(2)}
            </span>
          )}
          <span
            className={clsx(
              'text-xs',
              isProfitable ? 'text-green-400/70' : 'text-red-400/70'
            )}
          >
            {isProfitable ? '+' : ''}
            {pnlPercent.toFixed(2)}%
          </span>
        </div>
      </td>
      <td className="text-slate-300">
        {position.leverage}x
      </td>
      <td>
        <div className="flex flex-col text-xs">
          {position.stop_loss_price && (
            <div className="flex items-center gap-1 text-red-400">
              <Shield className="w-3 h-3" />
              ${position.stop_loss_price.toLocaleString()}
            </div>
          )}
          {position.take_profit_price && (
            <div className="flex items-center gap-1 text-green-400">
              <Target className="w-3 h-3" />
              ${position.take_profit_price.toLocaleString()}
            </div>
          )}
          {!position.stop_loss_price && !position.take_profit_price && (
            <span className="text-slate-500">-</span>
          )}
        </div>
      </td>
    </tr>
  );
}
