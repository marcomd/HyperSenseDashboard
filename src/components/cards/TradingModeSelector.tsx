import { Play, LogOut, Ban, Loader2, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';
import type { TradingMode, TradingModeName } from '@/types';
import { Tooltip } from '@/components/common/Tooltip';

interface TradingModeSelectorProps {
  tradingMode: TradingMode;
  onSwitch: (mode: TradingModeName, reason?: string) => void;
  isLoading?: boolean;
}

// Mode configuration with icons and descriptions
const MODES: {
  name: TradingModeName;
  label: string;
  icon: typeof Play;
  description: string;
  activeColor: string;
  iconColor: string;
}[] = [
  {
    name: 'enabled',
    label: 'Enabled',
    icon: Play,
    description: 'Normal operation',
    activeColor: 'border-green-500 bg-green-500/20',
    iconColor: 'text-green-400',
  },
  {
    name: 'exit_only',
    label: 'Exit Only',
    icon: LogOut,
    description: 'Close positions only',
    activeColor: 'border-yellow-500 bg-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    name: 'blocked',
    label: 'Blocked',
    icon: Ban,
    description: 'Trading halted',
    activeColor: 'border-red-500 bg-red-500/20',
    iconColor: 'text-red-400',
  },
];

/**
 * Displays a card with three mode-switching buttons for trading control.
 * Allows users to switch between Enabled, Exit Only, and Blocked modes.
 * Shows circuit breaker info when mode was set automatically.
 */
export function TradingModeSelector({
  tradingMode,
  onSwitch,
  isLoading = false,
}: TradingModeSelectorProps) {
  const isCircuitBreakerTriggered = tradingMode.changed_by === 'circuit_breaker';

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-semibold text-white">Trading Mode</h2>
          <Tooltip
            content={
              <div className="space-y-2">
                <p className="font-medium">Trading Mode Control</p>
                <div className="space-y-1.5">
                  <p className="text-slate-300 text-xs">
                    <span className="text-green-400 font-medium">Enabled:</span> Normal operation.
                    Can open and close positions.
                  </p>
                  <p className="text-slate-300 text-xs">
                    <span className="text-yellow-400 font-medium">Exit Only:</span> Can only close
                    existing positions. No new trades.
                  </p>
                  <p className="text-slate-300 text-xs">
                    <span className="text-red-400 font-medium">Blocked:</span> All trading halted.
                    No opens or closes.
                  </p>
                </div>
                <p className="text-slate-400 text-xs italic border-t border-slate-600 pt-2 mt-2">
                  The circuit breaker may automatically set Exit Only mode when risk thresholds are exceeded.
                </p>
              </div>
            }
            position="bottom"
          >
            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
          </Tooltip>
        </div>
      </div>
      <div className="card-body space-y-4">
        {/* Circuit breaker warning banner */}
        {isCircuitBreakerTriggered && tradingMode.mode === 'exit_only' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Circuit Breaker Triggered</div>
              <div className="text-yellow-300/80 text-xs mt-1">
                {tradingMode.reason || 'Trading restricted to position closures only.'}
              </div>
            </div>
          </div>
        )}

        {/* Mode buttons */}
        <div className="flex gap-2">
          {MODES.map(({ name, label, icon: Icon, description, activeColor, iconColor }) => {
            const isActive = tradingMode.mode === name;
            return (
              <button
                key={name}
                onClick={() => onSwitch(name)}
                disabled={isLoading || isActive}
                className={clsx(
                  'flex-1 p-3 rounded-lg border transition-all text-center',
                  isActive
                    ? `${activeColor} text-white`
                    : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading && isActive ? (
                  <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
                ) : (
                  <Icon className={clsx('w-5 h-5 mx-auto mb-2', isActive && iconColor)} />
                )}
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-slate-500">{description}</div>
              </button>
            );
          })}
        </div>

        {/* Mode Status Summary */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Can Open Positions</span>
              <span className={clsx(
                'block font-medium mt-1',
                tradingMode.can_open ? 'text-green-400' : 'text-red-400'
              )}>
                {tradingMode.can_open ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Can Close Positions</span>
              <span className={clsx(
                'block font-medium mt-1',
                tradingMode.can_close ? 'text-green-400' : 'text-red-400'
              )}>
                {tradingMode.can_close ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Changed by info */}
          {tradingMode.changed_by && tradingMode.changed_by !== 'system' && (
            <div className="mt-3 text-xs text-slate-500">
              Last changed by: <span className="text-slate-400">{tradingMode.changed_by}</span>
            </div>
          )}
        </div>

        {/* Info banner for user override */}
        {isCircuitBreakerTriggered && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-700/30 text-slate-400 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              You can override the circuit breaker by switching back to Enabled mode
              if you deem it safe to resume trading.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
