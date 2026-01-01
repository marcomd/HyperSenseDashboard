import clsx from 'clsx';
import type { VolatilityLevel } from '@/types';

interface VolatilityBadgeProps {
  level: VolatilityLevel | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const VOLATILITY_CONFIG: Record<VolatilityLevel, { color: string; label: string }> = {
  low: { color: 'bg-green-500/20 text-green-400', label: 'Low' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Medium' },
  high: { color: 'bg-orange-500/20 text-orange-400', label: 'High' },
  very_high: { color: 'bg-red-500/20 text-red-400', label: 'Very High' },
};

/**
 * Displays a color-coded badge for volatility level.
 *
 * Colors:
 * - Low: green
 * - Medium: yellow
 * - High: orange
 * - Very High: red
 *
 * Sizes:
 * - sm: smaller text for compact displays
 * - md: default size
 */
export function VolatilityBadge({ level, showLabel = true, size = 'md' }: VolatilityBadgeProps) {
  if (!level) return <span className="text-slate-400">-</span>;

  const config = VOLATILITY_CONFIG[level];

  return (
    <span className={clsx('badge', config.color, size === 'sm' && 'text-xs py-0 px-1.5')}>
      {showLabel && config.label}
    </span>
  );
}
