import { DollarSign, Cpu, Server, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import type { CostSummary } from '@/types';

interface CostSummaryCardProps {
  costs: CostSummary;
}

/**
 * Displays a summary of trading costs including:
 * - Net P&L (gross minus trading fees)
 * - Trading fees
 * - LLM costs
 * - Server costs
 */
export function CostSummaryCard({ costs }: CostSummaryCardProps) {
  const netProfitable = costs.net_realized_pnl >= 0;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Cost Summary</h2>
        <span className="text-xs text-slate-400 uppercase">{costs.period}</span>
      </div>
      <div className="card-body space-y-4">
        {/* Net P&L (main highlight) */}
        <div className="bg-bg-tertiary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            {netProfitable ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span>Net Realized P&L</span>
          </div>
          <div
            className={clsx(
              'text-2xl font-bold',
              netProfitable ? 'text-green-400' : 'text-red-400'
            )}
          >
            {netProfitable ? '+' : ''}${costs.net_realized_pnl.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Gross: ${costs.gross_realized_pnl.toFixed(2)} - Fees: $
            {costs.trading_fees.toFixed(4)}
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2">
          <CostRow
            icon={<DollarSign className="w-4 h-4" />}
            label="Trading Fees"
            value={costs.trading_fees}
            decimals={4}
          />
          <CostRow
            icon={<Cpu className="w-4 h-4" />}
            label="LLM Costs"
            value={costs.llm_costs}
            decimals={4}
            subtitle={`${costs.llm_provider} / ${costs.llm_model}`}
          />
          <CostRow
            icon={<Server className="w-4 h-4" />}
            label="Server (daily)"
            value={costs.server_cost_daily}
            decimals={2}
          />
        </div>

        {/* Total */}
        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total Costs</span>
            <span className="text-white font-bold">
              ${costs.total_costs.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CostRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  decimals?: number;
  subtitle?: string;
}

function CostRow({ icon, label, value, decimals = 2, subtitle }: CostRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <div>
          <span className="text-slate-300 text-sm">{label}</span>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
      </div>
      <span className="text-white font-mono text-sm">${value.toFixed(decimals)}</span>
    </div>
  );
}
