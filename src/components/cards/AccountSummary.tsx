import { TrendingUp, TrendingDown, Wallet, AlertCircle, Activity, Info, Building2, TestTube, Calculator, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
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
  const allTimeProfitable = account.all_time_pnl >= 0;
  const calculatedPnlProfitable = (account.calculated_pnl ?? 0) >= 0;
  const hasBalanceHistory = account.balance_history?.initial_balance !== null;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Account Summary</h2>
          {account.testnet_mode && (
            <div className="badge bg-yellow-500/20 text-yellow-400">
              <TestTube className="w-3 h-3 mr-1" />
              Testnet
            </div>
          )}
        </div>
        {!tradingAllowed && (
          <div className="badge bg-red-500/20 text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Circuit Breaker Active
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Exchange Balance */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Building2 className="w-4 h-4" />
              <span>Exchange Balance</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {account.hyperliquid?.configured && account.hyperliquid.balance !== null
                ? `$${account.hyperliquid.balance.toFixed(2)}`
                : '-'}
            </div>
          </div>

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

          {/* Calculated PnL - Primary metric if available */}
          <div className="bg-bg-tertiary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              {hasBalanceHistory ? (
                calculatedPnlProfitable ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )
              ) : allTimeProfitable ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span>{hasBalanceHistory ? 'Calculated P&L' : 'All-Time P&L'}</span>
              {hasBalanceHistory && (
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">Accurate P&L Calculation</p>
                      <p className="text-slate-300 text-xs">
                        Accounts for deposits and withdrawals to show true trading performance.
                      </p>
                      <div className="text-xs space-y-1 mt-2 font-mono bg-slate-800 p-2 rounded">
                        <div>= Current Balance - Initial Capital</div>
                        <div>- Total Deposits + Total Withdrawals</div>
                      </div>
                      {account.balance_history && (
                        <div className="text-xs space-y-1 mt-2 border-t border-slate-600 pt-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Initial:</span>
                            <span>${account.balance_history.initial_balance?.toFixed(2) ?? '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Deposits:</span>
                            <span className="text-green-400">
                              +${account.balance_history.total_deposits?.toFixed(2) ?? '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Withdrawals:</span>
                            <span className="text-red-400">
                              -${account.balance_history.total_withdrawals?.toFixed(2) ?? '0'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  }
                  position="bottom"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
                </Tooltip>
              )}
            </div>
            <div
              className={clsx(
                'text-2xl font-bold',
                hasBalanceHistory
                  ? calculatedPnlProfitable ? 'text-green-400' : 'text-red-400'
                  : allTimeProfitable ? 'text-green-400' : 'text-red-400'
              )}
            >
              {hasBalanceHistory
                ? `${calculatedPnlProfitable ? '+' : ''}$${(account.calculated_pnl ?? 0).toFixed(2)}`
                : `${allTimeProfitable ? '+' : ''}$${account.all_time_pnl.toFixed(2)}`}
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

        {/* Balance History Summary */}
        {hasBalanceHistory && (account.balance_history?.total_deposits || account.balance_history?.total_withdrawals) && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {account.balance_history?.total_deposits !== null && account.balance_history.total_deposits > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ArrowUpCircle className="w-4 h-4 text-green-400" />
                    <span>Deposits:</span>
                    <span className="text-green-400 font-medium">
                      +${account.balance_history.total_deposits.toFixed(2)}
                    </span>
                  </div>
                )}
                {account.balance_history?.total_withdrawals !== null && account.balance_history.total_withdrawals > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                    <span>Withdrawals:</span>
                    <span className="text-red-400 font-medium">
                      -${account.balance_history.total_withdrawals.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <Link
                to="/account-balances"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Balance History →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
