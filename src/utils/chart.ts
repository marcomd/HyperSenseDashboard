import type { EquityPoint } from '@/types';

/**
 * Calculates the gradient offset where zero falls within the data range.
 * Used to position the green/red color transition in the SVG gradient.
 *
 * @param data - Array of equity points with cumulative_pnl values
 * @returns Offset as percentage (0-1) from top of chart where zero line falls
 */
export function calculateGradientOffset(data: EquityPoint[]): number {
  if (data.length === 0) return 0.5;

  const values = data.map((d) => d.cumulative_pnl);
  const max = Math.max(...values);
  const min = Math.min(...values);

  // All values are negative or zero - offset near top (all red)
  if (max <= 0) return 0.001;

  // All values are positive or zero - offset near bottom (all green)
  if (min >= 0) return 0.999;

  // Zero falls somewhere in the range
  return max / (max - min);
}
