import { Shield, ShieldAlert, ShieldOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import type { RiskProfile, RiskProfileName } from '@/types';

interface RiskProfileSelectorProps {
  profile: RiskProfile;
  onSwitch: (profile: RiskProfileName) => void;
  isLoading?: boolean;
}

// Profile configuration with icons and descriptions
const PROFILES: {
  name: RiskProfileName;
  label: string;
  icon: typeof Shield;
  description: string;
  color: string;
}[] = [
  {
    name: 'cautious',
    label: 'Cautious',
    icon: ShieldAlert,
    description: 'Conservative trading',
    color: 'text-blue-400',
  },
  {
    name: 'moderate',
    label: 'Moderate',
    icon: Shield,
    description: 'Balanced approach',
    color: 'text-slate-400',
  },
  {
    name: 'fearless',
    label: 'Fearless',
    icon: ShieldOff,
    description: 'Aggressive trading',
    color: 'text-orange-400',
  },
];

/**
 * Displays a card with three profile-switching buttons for risk management.
 * Allows users to switch between Cautious, Moderate, and Fearless profiles.
 * Shows current parameters summary below the buttons.
 */
export function RiskProfileSelector({
  profile,
  onSwitch,
  isLoading = false,
}: RiskProfileSelectorProps) {
  const params = profile.parameters;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Risk Profile</h2>
      </div>
      <div className="card-body space-y-4">
        {/* Profile buttons */}
        <div className="flex gap-2">
          {PROFILES.map(({ name, label, icon: Icon, description, color }) => {
            const isActive = profile.name === name;
            return (
              <button
                key={name}
                onClick={() => onSwitch(name)}
                disabled={isLoading || isActive}
                className={clsx(
                  'flex-1 p-3 rounded-lg border transition-all text-center',
                  isActive
                    ? 'border-accent bg-accent/20 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading && isActive ? (
                  <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
                ) : (
                  <Icon className={clsx('w-5 h-5 mx-auto mb-2', isActive && color)} />
                )}
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-slate-500">{description}</div>
              </button>
            );
          })}
        </div>

        {/* Current Parameters Summary */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            Active Parameters
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <ParamItem
              label="Confidence"
              value={`${(params.min_confidence * 100).toFixed(0)}%`}
            />
            <ParamItem label="Leverage" value={`${params.default_leverage}x`} />
            <ParamItem label="Max Pos" value={`${params.max_open_positions}`} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mt-2">
            <ParamItem label="RSI Low" value={`${params.rsi_oversold}`} />
            <ParamItem label="RSI High" value={`${params.rsi_overbought}`} />
            <ParamItem label="R/R Min" value={`${params.min_risk_reward_ratio}:1`} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ParamItemProps {
  label: string;
  value: string;
}

function ParamItem({ label, value }: ParamItemProps) {
  return (
    <div className="bg-bg-tertiary/50 rounded px-2 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="block text-white font-mono">{value}</span>
    </div>
  );
}
