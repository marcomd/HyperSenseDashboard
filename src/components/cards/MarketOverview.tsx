import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';
import type { MarketOverview as MarketOverviewType } from '@/types';

interface MarketOverviewProps {
  market: Record<string, MarketOverviewType | null>;
}

export function MarketOverview({ market }: MarketOverviewProps) {
  const assets = Object.entries(market).filter(([, data]) => data !== null);

  if (assets.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-white">Market Overview</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-slate-400">
            No market data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Market Overview</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.map(([symbol, data]) => (
            <AssetCard key={symbol} symbol={symbol} data={data!} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetCard({ symbol, data }: { symbol: string; data: MarketOverviewType }) {
  const ForecastIcon = {
    bullish: TrendingUp,
    bearish: TrendingDown,
    neutral: Minus,
  }[data.forecast_direction ?? 'neutral'] ?? Minus;

  const forecastColor = {
    bullish: 'text-green-400',
    bearish: 'text-red-400',
    neutral: 'text-slate-400',
  }[data.forecast_direction ?? 'neutral'];

  const rsiColor =
    data.rsi_signal === 'oversold'
      ? 'text-green-400'
      : data.rsi_signal === 'overbought'
      ? 'text-red-400'
      : 'text-slate-300';

  const macdColor =
    data.macd_signal === 'bullish' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-bg-tertiary/50 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-xs font-bold text-accent">
              {symbol.slice(0, 2)}
            </span>
          </div>
          <span className="font-medium text-white">{symbol}</span>
        </div>
        <ForecastIcon className={clsx('w-5 h-5', forecastColor)} />
      </div>

      {/* Price */}
      <div className="text-2xl font-bold text-white mb-3">
        ${data.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      {/* Indicators */}
      <div className="space-y-2 text-sm">
        {/* RSI */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">RSI</span>
          <span className={rsiColor}>
            {data.rsi?.toFixed(1) ?? '-'}
            {data.rsi_signal && (
              <span className="ml-1 text-xs capitalize">
                ({data.rsi_signal})
              </span>
            )}
          </span>
        </div>

        {/* MACD */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">MACD</span>
          <span className={data.macd_signal ? macdColor : 'text-slate-500'}>
            {data.macd_signal ? (
              <span className="capitalize">{data.macd_signal}</span>
            ) : (
              '-'
            )}
          </span>
        </div>

        {/* EMA Position */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">EMA 50</span>
          <span
            className={
              data.above_ema_50 === true
                ? 'text-green-400'
                : data.above_ema_50 === false
                ? 'text-red-400'
                : 'text-slate-500'
            }
          >
            {data.above_ema_50 === true
              ? 'Above'
              : data.above_ema_50 === false
              ? 'Below'
              : '-'}
          </span>
        </div>

        {/* Forecast */}
        {data.forecast_change_pct !== null && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <span className="text-slate-400">1h Forecast</span>
            <span className={forecastColor}>
              {data.forecast_change_pct >= 0 ? '+' : ''}
              {data.forecast_change_pct.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
