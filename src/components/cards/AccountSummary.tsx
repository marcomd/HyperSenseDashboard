import { TrendingUp, TrendingDown, Wallet, DollarSign, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { AccountSummary as AccountSummaryType } from '@/types';

interface AccountSummaryProps {
  account: AccountSummaryType;
}

export function AccountSummary({ account }: AccountSummaryProps) {
  const isProfitable = account.total_unrealized_pnl >= 0;
  const todayProfitable = account.realized_pnl_today >= 0;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Account Summary</h2>
        {!account.circuit_breaker.trading_allowed && (
          <div className="badge bg-red-500/20 text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Circuit Breaker Active
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
