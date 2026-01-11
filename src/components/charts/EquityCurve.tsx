import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import clsx from 'clsx';
import type { PerformanceData } from '@/types';
import { calculateGradientOffset } from '@/utils/chart';

interface EquityCurveProps {
  data: PerformanceData | undefined;
  isLoading?: boolean;
  /** Percentage of initial capital for displaying ROI context */
  capitalPnlPercent?: number | null;
}

export function EquityCurve({ data, isLoading, capitalPnlPercent }: EquityCurveProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-white">Performance</h2>
        </div>
        <div className="card-body">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.equity_curve.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-white">Performance</h2>
        </div>
        <div className="card-body">
          <div className="h-64 flex items-center justify-center text-slate-400">
            No performance data available
          </div>
        </div>
      </div>
    );
  }

  const { equity_curve, statistics } = data;
  const isProfitable = statistics.total_pnl >= 0;
  const gradientOffset = calculateGradientOffset(equity_curve);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Performance</h2>
        <div
          className={clsx(
            'text-lg font-bold',
            isProfitable ? 'text-green-400' : 'text-red-400'
          )}
        >
          {isProfitable ? '+' : ''}${statistics.total_pnl.toFixed(2)}
          {capitalPnlPercent != null && (
            <span className="ml-1.5 text-sm font-medium">
              ({capitalPnlPercent >= 0 ? '+' : ''}{capitalPnlPercent.toFixed(2)}%)
            </span>
          )}
        </div>
      </div>
      <div className="card-body">
        {/* Statistics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <StatBox
            icon={<Award className="w-4 h-4" />}
            label="Win Rate"
            value={`${statistics.win_rate.toFixed(1)}%`}
            color={statistics.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}
          />
          <StatBox
            icon={<Target className="w-4 h-4" />}
            label="Total Trades"
            value={statistics.total_trades.toString()}
            color="text-white"
          />
          <StatBox
            icon={<TrendingUp className="w-4 h-4" />}
            label="Avg Win"
            value={`$${statistics.avg_win.toFixed(2)}`}
            color="text-green-400"
          />
          <StatBox
            icon={<TrendingDown className="w-4 h-4" />}
            label="Avg Loss"
            value={`$${Math.abs(statistics.avg_loss).toFixed(2)}`}
            color="text-red-400"
          />
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={equity_curve}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Fill gradient - green above zero, red below */}
                <linearGradient id="colorPnlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop
                    offset={`${gradientOffset * 100}%`}
                    stopColor="#22c55e"
                    stopOpacity={0.05}
                  />
                  <stop
                    offset={`${gradientOffset * 100}%`}
                    stopColor="#ef4444"
                    stopOpacity={0.05}
                  />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
                {/* Stroke gradient for the line */}
                <linearGradient id="colorPnlStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                  <stop
                    offset={`${gradientOffset * 100}%`}
                    stopColor="#22c55e"
                    stopOpacity={1}
                  />
                  <stop
                    offset={`${gradientOffset * 100}%`}
                    stopColor="#ef4444"
                    stopOpacity={1}
                  />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  return [`$${numValue.toFixed(2)}`, 'PnL'];
                }}
                labelFormatter={(label) => {
                  const date = new Date(label as string);
                  return date.toLocaleDateString();
                }}
              />
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="cumulative_pnl"
                stroke="url(#colorPnlStroke)"
                fillOpacity={1}
                fill="url(#colorPnlFill)"
                strokeWidth={2}
                baseValue={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Win/Loss Breakdown */}
        <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">
              {statistics.wins}
            </div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-red-400 font-bold text-lg">
              {statistics.losses}
            </div>
            <div className="text-xs text-slate-400">Losses</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={clsx('font-bold', color)}>{value}</div>
    </div>
  );
}
