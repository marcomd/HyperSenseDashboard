import { TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { MacroStrategy } from '@/types';

interface MacroStrategyCardProps {
  strategy: MacroStrategy | null;
}

export function MacroStrategyCard({ strategy }: MacroStrategyCardProps) {
  if (!strategy) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-white">Macro Strategy</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-center py-6 text-slate-400">
            <AlertTriangle className="w-5 h-5 mr-2" />
            No active strategy
          </div>
        </div>
      </div>
    );
  }

  const BiasIcon = {
    bullish: TrendingUp,
    bearish: TrendingDown,
    neutral: Minus,
  }[strategy.bias];

  const biasColor = {
    bullish: 'text-green-400',
    bearish: 'text-red-400',
    neutral: 'text-slate-400',
  }[strategy.bias];

  const biasBgColor = {
    bullish: 'bg-green-500/20',
    bearish: 'bg-red-500/20',
    neutral: 'bg-slate-500/20',
  }[strategy.bias];

  const validUntil = new Date(strategy.valid_until);
  const createdAt = new Date(strategy.created_at);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Macro Strategy</h2>
        {strategy.stale && (
          <div className="badge bg-yellow-500/20 text-yellow-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Stale
          </div>
        )}
      </div>
      <div className="card-body">
        {/* Bias and Risk Tolerance */}
        <div className="flex items-center gap-4 mb-4">
          <div className={clsx('p-3 rounded-lg', biasBgColor)}>
            <BiasIcon className={clsx('w-8 h-8', biasColor)} />
          </div>
          <div>
            <div className={clsx('text-2xl font-bold capitalize', biasColor)}>
              {strategy.bias}
            </div>
            <div className="text-sm text-slate-400">Market Bias</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-white">
              {(strategy.risk_tolerance * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-slate-400">Risk Tolerance</div>
          </div>
        </div>

        {/* Market Narrative */}
        <div className="bg-bg-tertiary/50 rounded-lg p-4 mb-4">
          <div className="text-sm text-slate-400 mb-2">Market Narrative</div>
          <p className="text-slate-200 text-sm leading-relaxed">
            {strategy.market_narrative}
          </p>
        </div>

        {/* Key Levels */}
        {strategy.key_levels && Object.keys(strategy.key_levels).length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-slate-400 mb-2">Key Levels</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(strategy.key_levels).map(([symbol, levels]) => (
                <div key={symbol} className="bg-bg-tertiary/50 rounded p-2">
                  <div className="font-medium text-white text-sm mb-1">{symbol}</div>
                  <div className="flex gap-2 text-xs">
                    {levels.support?.length > 0 && (
                      <div className="text-green-400">
                        S: {levels.support.map(s => s.toLocaleString()).join(', ')}
                      </div>
                    )}
                    {levels.resistance?.length > 0 && (
                      <div className="text-red-400">
                        R: {levels.resistance.map(r => r.toLocaleString()).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Created: {createdAt.toLocaleString()}
          </div>
          <div>
            Valid until: {validUntil.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
