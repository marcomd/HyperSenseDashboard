import { TrendingUp, TrendingDown, Wallet, DollarSign, AlertCircle, Activity, Info } from 'lucide-react';
import clsx from 'clsx';
import type { AccountSummary as AccountSummaryType, VolatilityLevel } from '@/types';
import { VolatilityBadge } from '@/components/common/VolatilityBadge';
import { Tooltip } from '@/components/common/Tooltip';
import { useTradingStatus } from '@/contexts/TradingStatusContext';

interface AccountSummaryProps {
  account: AccountSummaryType;
}

/** Label mapping for volatility levels */
const VOLATILITY_LABELS: Record<VolatilityLevel, string> = {
  very_high: 'Very High',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Order for displaying volatility levels (highest to lowest) */
const VOLATILITY_ORDER: VolatilityLevel[] = ['very_high', 'high', 'medium', 'low'];

export function AccountSummary({ account }: AccountSummaryProps) {
  const { tradingAllowed } = useTradingStatus();
  const isProfitable = account.total_unrealized_pnl >= 0;
  const todayProfitable = account.realized_pnl_today >= 0;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Account Summary</h2>
        {!tradingAllowed && (
          <div className="badge bg-red-500/20 text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Circuit Breaker Active
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Open Positions */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              <span>Open Positions</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {account.open_positions_count}
            </div>
          </div>

          {/* Unrealized PnL */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              {isProfitable ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span>Unrealized PnL</span>
            </div>
            <div
              className={clsx(
                'text-2xl font-bold',
                isProfitable ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isProfitable ? '+' : ''}${account.total_unrealized_pnl.toFixed(2)}
            </div>
          </div>

          {/* Margin Used */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Margin Used</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${account.total_margin_used.toFixed(2)}
            </div>
          </div>

          {/* Today's Realized PnL */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              {todayProfitable ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span>Today's P&L</span>
            </div>
            <div
              className={clsx(
                'text-2xl font-bold',
                todayProfitable ? 'text-green-400' : 'text-red-400'
              )}
            >
              {todayProfitable ? '+' : ''}${account.realized_pnl_today.toFixed(2)}
            </div>
          </div>

          {/* Volatility */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Activity className="w-4 h-4" />
              <span>Volatility</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">How volatility affects trading:</p>
                    <p className="text-slate-300 text-xs">
                      The agent adjusts its reactivity based on market volatility.
                      Higher volatility triggers more frequent analysis cycles.
                    </p>
                    {account.volatility_info?.intervals ? (
                      <ul className="text-xs space-y-1 mt-2">
                        {VOLATILITY_ORDER.map((level) => (
                          <li key={level} className="flex justify-between gap-4">
                            <span className="text-slate-300">{VOLATILITY_LABELS[level]}:</span>
                            <span className="text-white font-medium">
                              {account.volatility_info?.intervals?.[level]} min
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        Interval data not available
                      </p>
                    )}
                  </div>
                }
                position="bottom"
              >
                <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-2xl font-bold">
              <VolatilityBadge level={account.volatility_info?.volatility_level ?? null} />
            </div>
          </div>
        </div>

        {/* Circuit Breaker Info */}
        {(account.circuit_breaker.daily_loss !== null ||
          account.circuit_breaker.consecutive_losses !== null) && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-4 text-sm">
              {account.circuit_breaker.daily_loss !== null && (
                <div className="text-slate-400">
                  Daily Loss:{' '}
                  <span className="text-red-400">
                    -${Math.abs(account.circuit_breaker.daily_loss).toFixed(2)}
                  </span>
                </div>
              )}
              {account.circuit_breaker.consecutive_losses !== null && (
                <div className="text-slate-400">
                  Consecutive Losses:{' '}
                  <span className="text-red-400">
                    {account.circuit_breaker.consecutive_losses}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
